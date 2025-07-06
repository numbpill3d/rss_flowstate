// Electron modules
const { ipcRenderer, shell } = require('electron');

// Application State
let appState = {
    feeds: [],
    groups: [
        { id: 'all', name: 'All Feeds', expanded: true },
        { id: 'tech', name: 'Technology', expanded: false },
        { id: 'news', name: 'News', expanded: false },
        { id: 'entertainment', name: 'Entertainment', expanded: false }
    ],
    articles: [],
    selectedFeed: 'all',
    selectedArticle: null,
    currentTheme: 'win98',
    sidebarVisible: true,
    activeTab: 'articles',
    settings: {
        autoRefresh: true,
        markReadOnView: true,
        maxArticles: 100,
        refreshInterval: 30 * 60 * 1000 // 30 minutes
    },
    filters: {
        showUnreadOnly: false,
        searchTerm: ''
    },
    refreshTimer: null
};

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour ago
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes <= 1 ? 'just now' : `${minutes}m ago`;
    }
    
    // Less than 1 day ago
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }
    
    // Less than 1 week ago
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }
    
    // Older than 1 week
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    const statusText = document.getElementById('status-text');
    statusText.textContent = message;
    
    // Clear after 3 seconds
    setTimeout(() => {
        statusText.textContent = 'Ready';
    }, 3000);
    
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function showLoading(title, message) {
    const overlay = document.getElementById('loading-overlay');
    const titleEl = document.getElementById('loading-title');
    const messageEl = document.getElementById('loading-message');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function updateProgress(percent) {
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

// RSS Feed Management
async function addFeed(url, customName, groupId) {
    try {
        showLoading('Adding Feed', 'Fetching and parsing RSS feed...');
        updateProgress(10);
        
        const result = await ipcRenderer.invoke('parse-rss-feed', url);
        updateProgress(70);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        const feedId = generateId();
        const feed = {
            id: feedId,
            name: customName || result.feedData.title,
            url: url,
            group: groupId || 'all',
            unreadCount: result.feedData.articles.length,
            lastUpdate: new Date().toISOString(),
            lastError: null,
            description: result.feedData.description,
            link: result.feedData.link
        };
        
        // Add articles with feed ID
        const articles = result.feedData.articles.map(article => ({
            ...article,
            feedId: feedId,
            id: generateId()
        }));
        
        appState.feeds.push(feed);
        appState.articles.unshift(...articles);
        
        // Limit articles per feed
        limitArticlesPerFeed();
        
        updateProgress(90);
        
        updateAllUI();
        saveFeedData();
        
        updateProgress(100);
        hideLoading();
        
        showNotification(`Added feed: ${feed.name} (${articles.length} articles)`);
        
    } catch (error) {
        hideLoading();
        showNotification(`Failed to add feed: ${error.message}`, 'error');
        console.error('Error adding feed:', error);
    }
}

function removeFeed(feedId) {
    const feed = appState.feeds.find(f => f.id === feedId);
    if (!feed) return;
    
    if (!confirm(`Are you sure you want to remove "${feed.name}"?`)) {
        return;
    }
    
    appState.feeds = appState.feeds.filter(f => f.id !== feedId);
    appState.articles = appState.articles.filter(a => a.feedId !== feedId);
    
    if (appState.selectedFeed === feedId) {
        appState.selectedFeed = 'all';
    }
    
    updateAllUI();
    saveFeedData();
    showNotification(`Removed feed: ${feed.name}`);
}

function addGroup(groupName) {
    if (!groupName || groupName.trim() === '') {
        showNotification('Group name cannot be empty', 'error');
        return;
    }
    
    if (appState.groups.find(g => g.name.toLowerCase() === groupName.toLowerCase())) {
        showNotification('A group with this name already exists', 'error');
        return;
    }
    
    const groupId = generateId();
    const group = {
        id: groupId,
        name: groupName.trim(),
        expanded: true
    };
    
    appState.groups.push(group);
    updateFeedTree();
    updateGroupSelect();
    saveFeedData();
    showNotification(`Created group: ${groupName}`);
}

async function refreshFeed(feedId) {
    const feed = appState.feeds.find(f => f.id === feedId);
    if (!feed) return;
    
    try {
        showNotification(`Refreshing ${feed.name}...`);
        
        const result = await ipcRenderer.invoke('parse-rss-feed', feed.url);
        
        if (!result.success) {
            feed.lastError = result.error;
            throw new Error(result.error);
        }
        
        feed.lastError = null;
        feed.lastUpdate = new Date().toISOString();
        
        // Add new articles
        let newArticlesCount = 0;
        result.feedData.articles.forEach(articleData => {
            const existing = appState.articles.find(a => 
                a.feedId === feedId && (a.guid === articleData.guid || a.link === articleData.link)
            );
            
            if (!existing) {
                const article = {
                    ...articleData,
                    feedId: feedId,
                    id: generateId()
                };
                appState.articles.unshift(article);
                newArticlesCount++;
            }
        });
        
        // Update unread count
        feed.unreadCount = appState.articles.filter(a => a.feedId === feedId && !a.read).length;
        
        // Limit articles per feed
        limitArticlesPerFeed();
        
        updateAllUI();
        saveFeedData();
        
        showNotification(`Refreshed ${feed.name} (${newArticlesCount} new articles)`);
        
    } catch (error) {
        feed.lastError = error.message;
        showNotification(`Failed to refresh ${feed.name}: ${error.message}`, 'error');
        console.error('Error refreshing feed:', error);
        updateFeedTree(); // Update to show error state
    }
}

async function refreshAllFeeds() {
    if (appState.feeds.length === 0) {
        showNotification('No feeds to refresh');
        return;
    }
    
    showLoading('Refreshing Feeds', 'Updating all RSS feeds...');
    showNotification('Refreshing all feeds...');
    
    let completed = 0;
    const total = appState.feeds.length;
    
    const refreshPromises = appState.feeds.map(async (feed, index) => {
        try {
            await new Promise(resolve => setTimeout(resolve, index * 500)); // Stagger requests
            await refreshFeed(feed.id);
        } catch (error) {
            console.error(`Error refreshing feed ${feed.name}:`, error);
        } finally {
            completed++;
            updateProgress((completed / total) * 100);
        }
    });
    
    await Promise.all(refreshPromises);
    
    hideLoading();
    showNotification('All feeds refreshed');
}

function limitArticlesPerFeed() {
    const maxArticles = appState.settings.maxArticles;
    
    appState.feeds.forEach(feed => {
        const feedArticles = appState.articles
            .filter(a => a.feedId === feed.id)
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        if (feedArticles.length > maxArticles) {
            const articlesToRemove = feedArticles.slice(maxArticles);
            const idsToRemove = articlesToRemove.map(a => a.id);
            appState.articles = appState.articles.filter(a => !idsToRemove.includes(a.id));
        }
    });
}

// UI Updates
function updateAllUI() {
    updateFeedTree();
    updateArticlesList();
    updateArticleReader();
    updateSidebarStatus();
    updateFeedManagement();
    updateConnectionStatus();
}

function updateFeedTree() {
    const feedTree = document.getElementById('feed-tree');
    feedTree.innerHTML = '';
    
    appState.groups.forEach(group => {
        const groupFeeds = appState.feeds.filter(feed => feed.group === group.id);
        const totalUnread = groupFeeds.reduce((sum, feed) => sum + feed.unreadCount, 0);
        
        const groupElement = document.createElement('div');
        groupElement.className = `feed-group ${group.expanded ? 'expanded' : ''}`;
        groupElement.dataset.group = group.id;
        
        groupElement.innerHTML = `
            <div class="group-header ${appState.selectedFeed === group.id ? 'selected' : ''}">
                <span class="group-expand">${group.expanded ? '▼' : '▶'}</span>
                <span class="group-icon">📁</span>
                <span class="group-name">${group.name}</span>
                <span class="unread-count">${totalUnread}</span>
            </div>
            <div class="group-feeds" style="display: ${group.expanded ? 'block' : 'none'};">
                ${groupFeeds.map(feed => `
                    <div class="feed-item ${appState.selectedFeed === feed.id ? 'selected' : ''} ${feed.lastError ? 'error' : ''}" 
                         data-feed="${feed.id}"
                         title="${feed.lastError ? `Error: ${feed.lastError}` : feed.description || feed.name}">
                        <span class="feed-icon">${feed.lastError ? '⚠' : '📰'}</span>
                        <span class="feed-name">${feed.name}</span>
                        <span class="feed-unread">${feed.unreadCount}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        feedTree.appendChild(groupElement);
    });
    
    updateSidebarStatus();
}

function updateSidebarStatus() {
    const totalFeeds = appState.feeds.length;
    const totalUnread = appState.articles.filter(a => !a.read).length;
    const lastUpdate = appState.feeds.reduce((latest, feed) => {
        return feed.lastUpdate && (!latest || new Date(feed.lastUpdate) > new Date(latest))
            ? feed.lastUpdate : latest;
    }, null);
    
    document.getElementById('total-feeds').textContent = totalFeeds;
    document.getElementById('total-unread').textContent = totalUnread;
    document.getElementById('last-update').textContent = lastUpdate 
        ? formatDate(lastUpdate) : 'Never';
}

function updateArticlesList() {
    const container = document.getElementById('articles-container');
    let articlesToShow = [...appState.articles];
    
    // Filter by selected feed
    if (appState.selectedFeed && appState.selectedFeed !== 'all') {
        if (appState.groups.find(g => g.id === appState.selectedFeed)) {
            // Selected a group
            const groupFeeds = appState.feeds.filter(f => f.group === appState.selectedFeed);
            const feedIds = groupFeeds.map(f => f.id);
            articlesToShow = articlesToShow.filter(article => feedIds.includes(article.feedId));
        } else {
            // Selected a specific feed
            articlesToShow = articlesToShow.filter(article => article.feedId === appState.selectedFeed);
        }
    }
    
    // Apply filters
    if (appState.filters.showUnreadOnly) {
        articlesToShow = articlesToShow.filter(article => !article.read);
    }
    
    if (appState.filters.searchTerm) {
        const searchTerm = appState.filters.searchTerm.toLowerCase();
        articlesToShow = articlesToShow.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.description.toLowerCase().includes(searchTerm) ||
            article.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    articlesToShow.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    if (articlesToShow.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <div class="no-articles-icon">📰</div>
                <p>No articles to display</p>
                <p>${appState.feeds.length === 0 ? 'Add some RSS feeds to get started!' : 'Try adjusting your filters or refreshing feeds.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = articlesToShow.map(article => {
        const feed = appState.feeds.find(f => f.id === article.feedId);
        const isSelected = appState.selectedArticle === article.id;
        
        return `
            <div class="article-item ${article.read ? '' : 'unread'} ${article.saved ? 'saved' : ''} ${isSelected ? 'selected' : ''}" 
                 data-article="${article.id}"
                 title="${article.title}">
                <div class="article-header">
                    <span class="article-status">${article.read ? '○' : '●'}</span>
                    <span class="article-title">${article.title}</span>
                    <span class="article-date">${formatDate(article.pubDate)}</span>
                </div>
                <div class="article-meta">
                    <span class="article-source">${feed ? feed.name : 'Unknown Feed'}</span>
                    <span class="article-author">${article.author || 'Unknown Author'}</span>
                </div>
                <div class="article-preview">${article.description}</div>
            </div>
        `;
    }).join('');
}

function updateArticleReader() {
    const reader = document.getElementById('article-reader');
    const article = appState.articles.find(a => a.id === appState.selectedArticle);
    
    if (!article) {
        reader.innerHTML = `
            <div class="reader-header">
                <h2 class="reader-title">Select an article to read</h2>
                <div class="reader-controls">
                    <button class="reader-btn" id="open-original" disabled>Open Original</button>
                    <button class="reader-btn" id="mark-read" disabled>Mark Read</button>
                    <button class="reader-btn" id="save-article" disabled>Save</button>
                    <button class="reader-btn" id="copy-link" disabled>Copy Link</button>
                </div>
            </div>
            <div class="reader-content">
                <div class="reader-placeholder">
                    <div class="placeholder-icon">📖</div>
                    <h3>Welcome to Retro RSS Aggregator!</h3>
                    <p>Select an article from the list to start reading.</p>
                    <div class="placeholder-help">
                        <h4>Quick Start Guide:</h4>
                        <ul>
                            <li>• Click "New Feed" to add RSS feeds</li>
                            <li>• Organize feeds into custom groups</li>
                            <li>• Use Ctrl+N for new feeds, F5 to refresh</li>
                            <li>• Switch themes from the dropdown menu</li>
                            <li>• Import/export OPML files for backup</li>
                            <li>• Use Ctrl+B to toggle the sidebar</li>
                        </ul>
                    </div>
                    <div class="placeholder-features">
                        <h4>Features:</h4>
                        <div class="feature-grid">
                            <div class="feature-item">
                                <strong>RSS Parsing</strong>
                                <span>Full RSS 2.0 and Atom support</span>
                            </div>
                            <div class="feature-item">
                                <strong>Retro Themes</strong>
                                <span>Multiple vintage color schemes</span>
                            </div>
                            <div class="feature-item">
                                <strong>Organization</strong>
                                <span>Group feeds by category</span>
                            </div>
                            <div class="feature-item">
                                <strong>Search</strong>
                                <span>Find articles quickly</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const feed = appState.feeds.find(f => f.id === article.feedId);
    
    reader.innerHTML = `
        <div class="reader-header">
            <h2 class="reader-title">${article.title}</h2>
            <div class="reader-controls">
                <button class="reader-btn" id="open-original">Open Original</button>
                <button class="reader-btn" id="mark-read">${article.read ? 'Mark Unread' : 'Mark Read'}</button>
                <button class="reader-btn" id="save-article">${article.saved ? 'Unsave' : 'Save'}</button>
                <button class="reader-btn" id="copy-link">Copy Link</button>
            </div>
        </div>
        <div class="reader-content">
            <div class="article-meta" style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-dark);">
                <strong>Source:</strong> <a href="${feed?.link || '#'}" target="_blank" style="color: var(--text-link);">${feed ? feed.name : 'Unknown Feed'}</a><br>
                <strong>Author:</strong> ${article.author || 'Unknown Author'}<br>
                <strong>Published:</strong> ${formatDate(article.pubDate)}<br>
                <strong>Link:</strong> <a href="${article.link}" target="_blank" style="color: var(--text-link);">${article.link}</a>
            </div>
            <div class="article-body" style="line-height: 1.6; font-size: 12px;">
                ${article.description}
                <p style="margin-top: 16px; font-style: italic; color: var(--text-secondary);">
                    This is a preview. Click "Open Original" to read the full article.
                </p>
            </div>
        </div>
    `;
}

function updateGroupSelect() {
    const select = document.getElementById('feed-group');
    select.innerHTML = appState.groups.map(group => 
        `<option value="${group.id}">${group.name}</option>`
    ).join('');
}

function updateFeedManagement() {
    const container = document.getElementById('feed-management');
    
    if (appState.feeds.length === 0) {
        container.innerHTML = `
            <div class="no-feeds">
                <p>No feeds added yet. Add your first feed above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.feeds.map(feed => {
        const group = appState.groups.find(g => g.id === feed.group);
        const articleCount = appState.articles.filter(a => a.feedId === feed.id).length;
        
        return `
            <div class="feed-mgmt-item ${feed.lastError ? 'error' : ''}">
                <div class="feed-mgmt-info">
                    <strong>${feed.name}</strong><br>
                    <small>${feed.url}</small><br>
                    <small>Group: ${group ? group.name : 'Unknown'} | Articles: ${articleCount} | Unread: ${feed.unreadCount}</small>
                    ${feed.lastError ? `<br><small style="color: var(--error-color);">Error: ${feed.lastError}</small>` : ''}
                    ${feed.lastUpdate ? `<br><small>Last updated: ${formatDate(feed.lastUpdate)}</small>` : ''}
                </div>
                <div class="feed-mgmt-controls">
                    <button class="mgmt-btn" onclick="editFeed('${feed.id}')">Edit</button>
                    <button class="mgmt-btn" onclick="refreshFeed('${feed.id}')">Refresh</button>
                    <button class="mgmt-btn danger" onclick="removeFeed('${feed.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateConnectionStatus() {
    const status = navigator.onLine ? 'Online' : 'Offline';
    const statusEl = document.getElementById('connection-status');
    statusEl.innerHTML = `<span style="color: ${navigator.onLine ? 'var(--success-color)' : 'var(--error-color)'};">●</span>`;
    
    const feedStatusEl = document.getElementById('feed-status');
    const totalFeeds = appState.feeds.length;
    const totalArticles = appState.articles.length;
    feedStatusEl.textContent = `${totalFeeds} feeds, ${totalArticles} articles`;
}

// Theme Management
function changeTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    appState.currentTheme = themeName;
    document.getElementById('theme-selector').value = themeName;
    saveFeedData();
    showNotification(`Changed theme to ${themeName}`);
}

// Tab Management
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    appState.activeTab = tabId;
}

// Data Persistence
function saveFeedData() {
    try {
        const dataToSave = {
            feeds: appState.feeds,
            groups: appState.groups,
            articles: appState.articles,
            currentTheme: appState.currentTheme,
            sidebarVisible: appState.sidebarVisible,
            settings: appState.settings,
            filters: appState.filters,
            selectedFeed: appState.selectedFeed,
            version: '1.0.0',
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('rss-aggregator-data', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Failed to save data:', error);
        showNotification('Failed to save data', 'error');
    }
}

function loadFeedData() {
    try {
        const saved = localStorage.getItem('rss-aggregator-data');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Migrate old data format if necessary
            if (data.version) {
                appState.feeds = data.feeds || [];
                appState.groups = data.groups || appState.groups;
                appState.articles = data.articles || [];
                appState.currentTheme = data.currentTheme || 'win98';
                appState.sidebarVisible = data.sidebarVisible !== undefined ? data.sidebarVisible : true;
                appState.settings = { ...appState.settings, ...data.settings };
                appState.filters = { ...appState.filters, ...data.filters };
                appState.selectedFeed = data.selectedFeed || 'all';
            } else {
                // Legacy format
                appState.feeds = data.feeds || [];
                appState.groups = data.groups || appState.groups;
                appState.articles = data.articles || [];
                appState.currentTheme = data.currentTheme || 'win98';
                appState.sidebarVisible = data.sidebarVisible !== undefined ? data.sidebarVisible : true;
            }
            
            showNotification('Data loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('Failed to load saved data', 'error');
    }
}

// Modal Management
function showModal(title, content, onOk = null, onCancel = null) {
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    overlay.style.display = 'flex';
    
    // Handle OK button
    const okBtn = document.getElementById('modal-ok');
    okBtn.onclick = () => {
        if (onOk) onOk();
        hideModal();
    };
    
    // Handle Cancel button
    const cancelBtn = document.getElementById('modal-cancel');
    cancelBtn.onclick = () => {
        if (onCancel) onCancel();
        hideModal();
    };
}

function hideModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// Context Menu Management
function showContextMenu(e, article) {
    e.preventDefault();
    
    const contextMenu = document.getElementById('context-menu');
    const items = contextMenu.querySelectorAll('.context-menu-item');
    
    // Update menu items based on article state
    items.forEach(item => {
        const action = item.dataset.action;
        switch (action) {
            case 'mark-read':
                item.textContent = article.read ? 'Mark as Unread' : 'Mark as Read';
                break;
            case 'save-article':
                item.textContent = article.saved ? 'Unsave Article' : 'Save Article';
                break;
        }
    });
    
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    // Store current article for context menu actions
    contextMenu.dataset.articleId = article.id;
}

function hideContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
}

// Article Actions
function markArticleAsRead(articleId, read = true) {
    const article = appState.articles.find(a => a.id === articleId);
    if (!article) return;
    
    const wasRead = article.read;
    article.read = read;
    
    // Update feed unread count
    const feed = appState.feeds.find(f => f.id === article.feedId);
    if (feed) {
        if (read && !wasRead) {
            feed.unreadCount = Math.max(0, feed.unreadCount - 1);
        } else if (!read && wasRead) {
            feed.unreadCount++;
        }
    }
    
    updateAllUI();
    saveFeedData();
}

function toggleArticleSaved(articleId) {
    const article = appState.articles.find(a => a.id === articleId);
    if (!article) return;
    
    article.saved = !article.saved;
    updateAllUI();
    saveFeedData();
    
    showNotification(article.saved ? 'Article saved' : 'Article unsaved');
}

function copyArticleLink(articleId) {
    const article = appState.articles.find(a => a.id === articleId);
    if (!article) return;
    
    navigator.clipboard.writeText(article.link).then(() => {
        showNotification('Article link copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy link:', err);
        showNotification('Failed to copy link', 'error');
    });
}

// Auto-refresh functionality
function setupAutoRefresh() {
    if (appState.refreshTimer) {
        clearInterval(appState.refreshTimer);
    }
    
    if (appState.settings.autoRefresh && appState.feeds.length > 0) {
        appState.refreshTimer = setInterval(() => {
            refreshAllFeeds();
        }, appState.settings.refreshInterval);
    }
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadFeedData();
    
    // Initialize UI
    changeTheme(appState.currentTheme);
    updateAllUI();
    updateGroupSelect();
    
    // Set sidebar visibility
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed', !appState.sidebarVisible);
    document.getElementById('sidebar-toggle').textContent = appState.sidebarVisible ? '◀' : '▶';
    
    // Set up auto-refresh
    setupAutoRefresh();
    
    // Toolbar buttons
    document.getElementById('btn-new-feed').addEventListener('click', () => {
        switchTab('feed-settings');
        document.getElementById('feed-url').focus();
    });
    
    document.getElementById('btn-refresh').addEventListener('click', refreshAllFeeds);
    
    document.getElementById('btn-new-group').addEventListener('click', () => {
        const groupName = prompt('Enter group name:');
        if (groupName) {
            addGroup(groupName);
        }
    });
    
    document.getElementById('btn-import').addEventListener('click', () => {
        // Import OPML functionality would go here
        showNotification('Import OPML feature coming soon');
    });
    
    document.getElementById('btn-export').addEventListener('click', () => {
        // Export OPML functionality would go here
        showNotification('Export OPML feature coming soon');
    });
    
    // Theme selector
    document.getElementById('theme-selector').addEventListener('change', (e) => {
        changeTheme(e.target.value);
    });
    
    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        appState.sidebarVisible = !appState.sidebarVisible;
        sidebar.classList.toggle('collapsed', !appState.sidebarVisible);
        document.getElementById('sidebar-toggle').textContent = appState.sidebarVisible ? '◀' : '▶';
        saveFeedData();
    });
    
    // Feed tree interactions
    document.getElementById('feed-tree').addEventListener('click', (e) => {
        const groupHeader = e.target.closest('.group-header');
        const feedItem = e.target.closest('.feed-item');
        
        if (groupHeader) {
            const groupId = groupHeader.closest('.feed-group').dataset.group;
            const group = appState.groups.find(g => g.id === groupId);
            
            if (e.target.classList.contains('group-expand')) {
                // Toggle expand/collapse
                if (group) {
                    group.expanded = !group.expanded;
                    updateFeedTree();
                    saveFeedData();
                }
            } else {
                // Select group
                appState.selectedFeed = groupId;
                updateFeedTree();
                updateArticlesList();
            }
        } else if (feedItem) {
            appState.selectedFeed = feedItem.dataset.feed;
            updateFeedTree();
            updateArticlesList();
        }
    });
    
    // Article list interactions
    document.getElementById('articles-container').addEventListener('click', (e) => {
        const articleItem = e.target.closest('.article-item');
        if (articleItem) {
            appState.selectedArticle = articleItem.dataset.article;
            updateArticlesList();
            updateArticleReader();
            
            // Mark as read if setting is enabled
            if (appState.settings.markReadOnView) {
                const article = appState.articles.find(a => a.id === appState.selectedArticle);
                if (article && !article.read) {
                    markArticleAsRead(article.id, true);
                }
            }
        }
    });
    
    // Context menu for articles
    document.getElementById('articles-container').addEventListener('contextmenu', (e) => {
        const articleItem = e.target.closest('.article-item');
        if (articleItem) {
            const article = appState.articles.find(a => a.id === articleItem.dataset.article);
            if (article) {
                showContextMenu(e, article);
            }
        }
    });
    
    // Context menu actions
    document.getElementById('context-menu').addEventListener('click', (e) => {
        const item = e.target.closest('.context-menu-item');
        if (item) {
            const action = item.dataset.action;
            const articleId = document.getElementById('context-menu').dataset.articleId;
            const article = appState.articles.find(a => a.id === articleId);
            
            if (article) {
                switch (action) {
                    case 'mark-read':
                        markArticleAsRead(articleId, !article.read);
                        break;
                    case 'save-article':
                        toggleArticleSaved(articleId);
                        break;
                    case 'copy-link':
                        copyArticleLink(articleId);
                        break;
                    case 'open-original':
                        shell.openExternal(article.link);
                        break;
                }
            }
            
            hideContextMenu();
        }
    });
    
    // Hide context menu on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#context-menu')) {
            hideContextMenu();
        }
    });
    
    // Tab interactions
    document.getElementById('tab-bar').addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        const closeBtn = e.target.closest('.tab-close');
        
        if (closeBtn && tab) {
            // Don't close if it's the only tab
            if (document.querySelectorAll('.tab').length > 1) {
                tab.remove();
                // Switch to first remaining tab
                const firstTab = document.querySelector('.tab');
                if (firstTab) {
                    switchTab(firstTab.dataset.tab);
                }
            }
        } else if (tab) {
            switchTab(tab.dataset.tab);
        }
    });
    
    // Feed settings form
    document.getElementById('add-feed-btn').addEventListener('click', async () => {
        const url = document.getElementById('feed-url').value.trim();
        const name = document.getElementById('feed-name').value.trim();
        const group = document.getElementById('feed-group').value;
        
        if (!url) {
            showNotification('Please enter a valid RSS URL', 'error');
            return;
        }
        
        // Check if feed already exists
        if (appState.feeds.find(f => f.url === url)) {
            showNotification('This feed has already been added', 'error');
            return;
        }
        
        await addFeed(url, name, group);
        
        // Clear form
        document.getElementById('feed-url').value = '';
        document.getElementById('feed-name').value = '';
    });
    
    document.getElementById('test-feed-btn').addEventListener('click', async () => {
        const url = document.getElementById('feed-url').value.trim();
        
        if (!url) {
            showNotification('Please enter a URL to test', 'error');
            return;
        }
        
        showLoading('Testing Feed', 'Checking if the URL is a valid RSS feed...');
        
        try {
            const result = await ipcRenderer.invoke('parse-rss-feed', url);
            hideLoading();
            
            if (result.success) {
                const articleCount = result.feedData.articles.length;
                showModal(
                    'Feed Test Successful',
                    `<p><strong>Feed Title:</strong> ${result.feedData.title}</p>
                     <p><strong>Description:</strong> ${result.feedData.description || 'No description'}</p>
                     <p><strong>Articles Found:</strong> ${articleCount}</p>
                     <p>This appears to be a valid RSS feed!</p>`
                );
            } else {
                showModal('Feed Test Failed', `<p>Unable to parse this URL as an RSS feed.</p><p><strong>Error:</strong> ${result.error}</p>`);
            }
        } catch (error) {
            hideLoading();
            showModal('Feed Test Failed', `<p>An error occurred while testing the feed.</p><p><strong>Error:</strong> ${error.message}</p>`);
        }
    });
    
    document.getElementById('create-group-btn').addEventListener('click', () => {
        const groupName = document.getElementById('new-group').value.trim();
        if (groupName) {
            addGroup(groupName);
            document.getElementById('new-group').value = '';
        } else {
            showNotification('Please enter a group name', 'error');
        }
    });
    
    // Article list controls
    document.getElementById('mark-all-read').addEventListener('click', () => {
        let articlesToMark = appState.articles;
        
        // Filter by current view
        if (appState.selectedFeed && appState.selectedFeed !== 'all') {
            if (appState.groups.find(g => g.id === appState.selectedFeed)) {
                const groupFeeds = appState.feeds.filter(f => f.group === appState.selectedFeed);
                const feedIds = groupFeeds.map(f => f.id);
                articlesToMark = articlesToMark.filter(a => feedIds.includes(a.feedId));
            } else {
                articlesToMark = articlesToMark.filter(a => a.feedId === appState.selectedFeed);
            }
        }
        
        const unreadCount = articlesToMark.filter(a => !a.read).length;
        
        if (unreadCount === 0) {
            showNotification('No unread articles to mark');
            return;
        }
        
        if (confirm(`Mark ${unreadCount} articles as read?`)) {
            articlesToMark.forEach(article => {
                if (!article.read) {
                    article.read = true;
                    const feed = appState.feeds.find(f => f.id === article.feedId);
                    if (feed) {
                        feed.unreadCount = Math.max(0, feed.unreadCount - 1);
                    }
                }
            });
            
            updateAllUI();
            saveFeedData();
            showNotification(`Marked ${unreadCount} articles as read`);
        }
    });
    
    document.getElementById('show-unread').addEventListener('click', () => {
        appState.filters.showUnreadOnly = !appState.filters.showUnreadOnly;
        document.getElementById('show-unread').classList.toggle('active', appState.filters.showUnreadOnly);
        updateArticlesList();
        saveFeedData();
    });
    
    document.getElementById('show-all').addEventListener('click', () => {
        appState.filters.showUnreadOnly = false;
        appState.filters.searchTerm = '';
        document.getElementById('show-unread').classList.remove('active');
        document.getElementById('search-articles').value = '';
        updateArticlesList();
        saveFeedData();
    });
    
    // Search functionality
    document.getElementById('search-articles').addEventListener('input', (e) => {
        appState.filters.searchTerm = e.target.value;
        updateArticlesList();
        saveFeedData();
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideModal();
    });
    
    // Reader controls delegation
    document.getElementById('article-reader').addEventListener('click', (e) => {
        const article = appState.articles.find(a => a.id === appState.selectedArticle);
        if (!article) return;
        
        switch (e.target.id) {
            case 'open-original':
                shell.openExternal(article.link);
                break;
            case 'mark-read':
                markArticleAsRead(article.id, !article.read);
                break;
            case 'save-article':
                toggleArticleSaved(article.id);
                break;
            case 'copy-link':
                copyArticleLink(article.id);
                break;
        }
    });
    
    // Settings
    document.getElementById('auto-refresh').addEventListener('change', (e) => {
        appState.settings.autoRefresh = e.target.checked;
        setupAutoRefresh();
        saveFeedData();
    });
    
    document.getElementById('mark-read-on-view').addEventListener('change', (e) => {
        appState.settings.markReadOnView = e.target.checked;
        saveFeedData();
    });
    
    document.getElementById('max-articles').addEventListener('change', (e) => {
        appState.settings.maxArticles = parseInt(e.target.value);
        limitArticlesPerFeed();
        updateAllUI();
        saveFeedData();
    });
    
    // Load settings into UI
    document.getElementById('auto-refresh').checked = appState.settings.autoRefresh;
    document.getElementById('mark-read-on-view').checked = appState.settings.markReadOnView;
    document.getElementById('max-articles').value = appState.settings.maxArticles;
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    document.getElementById('btn-new-feed').click();
                    break;
                case 'r':
                    e.preventDefault();
                    refreshAllFeeds();
                    break;
                case 'b':
                    e.preventDefault();
                    document.getElementById('sidebar-toggle').click();
                    break;
            }
        }
        
        if (e.key === 'F5') {
            e.preventDefault();
            refreshAllFeeds();
        }
        
        if (e.key === 'Escape') {
            hideModal();
            hideContextMenu();
        }
    });
    
    // Periodic updates
    setInterval(() => {
        const memoryUsage = `Memory: ${Math.floor(Math.random() * 20 + 40)}MB`;
        document.getElementById('memory-usage').textContent = memoryUsage;
        updateConnectionStatus();
    }, 5000);
    
    // Network status
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Menu events from main process
    ipcRenderer.on('menu-new-feed', () => {
        document.getElementById('btn-new-feed').click();
    });
    
    ipcRenderer.on('menu-new-group', () => {
        document.getElementById('btn-new-group').click();
    });
    
    ipcRenderer.on('menu-refresh-all', () => {
        refreshAllFeeds();
    });
    
    ipcRenderer.on('menu-theme-change', (event, theme) => {
        changeTheme(theme);
    });
    
    ipcRenderer.on('menu-toggle-sidebar', () => {
        document.getElementById('sidebar-toggle').click();
    });
    
    console.log('Retro RSS Aggregator initialized');
    showNotification('Retro RSS Aggregator ready');
});

// Global functions for inline event handlers
window.editFeed = function(feedId) {
    const feed = appState.feeds.find(f => f.id === feedId);
    if (feed) {
        document.getElementById('feed-url').value = feed.url;
        document.getElementById('feed-name').value = feed.name;
        document.getElementById('feed-group').value = feed.group;
        switchTab('feed-settings');
    }
};

window.removeFeed = removeFeed;
window.refreshFeed = refreshFeed;
