// Application State
let appState = {
    feeds: [
        {
            id: 'sample',
            name: 'Sample News Feed',
            url: 'https://example.com/feed.xml',
            group: 'all',
            unreadCount: 5,
            lastUpdate: null,
            articles: []
        }
    ],
    groups: [
        { id: 'all', name: 'All Feeds', expanded: true },
        { id: 'tech', name: 'Technology', expanded: false },
        { id: 'news', name: 'News', expanded: false }
    ],
    articles: [
        {
            id: '1',
            feedId: 'sample',
            title: 'Sample Article: Technology Advances in 2025',
            link: 'https://example.com/article1',
            description: 'This is a sample article preview. It shows how articles will appear in the RSS aggregator with proper formatting and metadata display. The article discusses various technological advances happening in 2025.',
            pubDate: '2025-06-08',
            author: 'John Doe',
            read: false,
            saved: false
        },
        {
            id: '2',
            feedId: 'sample',
            title: 'Another Sample: Windows 98 Nostalgia',
            link: 'https://example.com/article2',
            description: 'Remember the good old days of Windows 98? This retro RSS reader brings back those memories with authentic styling. From the classic grey interface to the familiar button styles, every detail has been carefully crafted.',
            pubDate: '2025-06-07',
            author: 'Jane Smith',
            read: true,
            saved: false
        }
    ],
    selectedFeed: null,
    selectedArticle: null,
    currentTheme: 'win98',
    sidebarVisible: true,
    activeTab: 'articles'
};

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const statusText = document.getElementById('status-text');
    statusText.textContent = message;
    
    // Clear after 3 seconds
    setTimeout(() => {
        statusText.textContent = 'Ready';
    }, 3000);
}

// RSS Parser (simplified for demo)
async function parseRSSFeed(url) {
    try {
        // In a real implementation, this would fetch and parse RSS
        // For demo purposes, we'll return sample data
        const sampleArticles = [
            {
                id: generateId(),
                title: `Article from ${url}`,
                link: `${url}/article1`,
                description: 'This is a sample article fetched from the RSS feed.',
                pubDate: new Date().toISOString(),
                author: 'RSS Author',
                read: false,
                saved: false
            }
        ];
        
        return {
            success: true,
            articles: sampleArticles,
            feedTitle: `Feed from ${new URL(url).hostname}`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Feed Management
function addFeed(url, name, groupId) {
    const feedId = generateId();
    const feed = {
        id: feedId,
        name: name || `Feed ${appState.feeds.length + 1}`,
        url: url,
        group: groupId || 'all',
        unreadCount: 0,
        lastUpdate: null,
        articles: []
    };
    
    appState.feeds.push(feed);
    updateFeedTree();
    saveFeedData();
    
    // Fetch feed content
    refreshFeed(feedId);
    
    showNotification(`Added feed: ${feed.name}`);
}

function removeFeed(feedId) {
    appState.feeds = appState.feeds.filter(feed => feed.id !== feedId);
    appState.articles = appState.articles.filter(article => article.feedId !== feedId);
    updateFeedTree();
    updateArticlesList();
    saveFeedData();
    showNotification('Feed removed');
}

function addGroup(groupName) {
    const groupId = generateId();
    const group = {
        id: groupId,
        name: groupName,
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
    
    showNotification(`Refreshing ${feed.name}...`);
    
    const result = await parseRSSFeed(feed.url);
    if (result.success) {
        // Add new articles
        result.articles.forEach(article => {
            article.feedId = feedId;
            const existing = appState.articles.find(a => a.link === article.link);
            if (!existing) {
                appState.articles.unshift(article);
                feed.unreadCount++;
            }
        });
        
        feed.lastUpdate = new Date().toISOString();
        updateFeedTree();
        updateArticlesList();
        saveFeedData();
        showNotification(`Refreshed ${feed.name}`);
    } else {
        showNotification(`Failed to refresh ${feed.name}: ${result.error}`);
    }
}

function refreshAllFeeds() {
    showNotification('Refreshing all feeds...');
    appState.feeds.forEach(feed => {
        setTimeout(() => refreshFeed(feed.id), Math.random() * 2000);
    });
}

// UI Updates
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
            <div class="group-header">
                <span class="group-expand">${group.expanded ? '▼' : '▶'}</span>
                <span class="group-icon">📁</span>
                <span class="group-name">${group.name}</span>
                <span class="unread-count">${totalUnread}</span>
            </div>
            <div class="group-feeds" style="display: ${group.expanded ? 'block' : 'none'};">
                ${groupFeeds.map(feed => `
                    <div class="feed-item ${appState.selectedFeed === feed.id ? 'selected' : ''}" 
                         data-feed="${feed.id}">
                        <span class="feed-icon">📰</span>
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
    let articlesToShow = appState.articles;
    
    // Filter by selected feed
    if (appState.selectedFeed && appState.selectedFeed !== 'all') {
        articlesToShow = articlesToShow.filter(article => article.feedId === appState.selectedFeed);
    }
    
    // Sort by date (newest first)
    articlesToShow.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    container.innerHTML = articlesToShow.map(article => {
        const feed = appState.feeds.find(f => f.id === article.feedId);
        return `
            <div class="article-item ${article.read ? '' : 'unread'} ${appState.selectedArticle === article.id ? 'selected' : ''}" 
                 data-article="${article.id}">
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
                    <button class="reader-btn" id="open-original">Open Original</button>
                    <button class="reader-btn" id="mark-read">Mark Read</button>
                    <button class="reader-btn" id="save-article">Save</button>
                </div>
            </div>
            <div class="reader-content">
                <div class="reader-placeholder">
                    <div class="placeholder-icon">📖</div>
                    <p>Welcome to Retro RSS Aggregator!</p>
                    <p>Select an article from the list to start reading.</p>
                    <div class="placeholder-help">
                        <h4>Quick Start:</h4>
                        <ul>
                            <li>• Click "New Feed" to add RSS feeds</li>
                            <li>• Organize feeds into groups</li>
                            <li>• Use keyboard shortcuts for quick navigation</li>
                            <li>• Switch themes from the dropdown</li>
                        </ul>
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
            </div>
        </div>
        <div class="reader-content">
            <div class="article-meta" style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-dark);">
                <strong>Source:</strong> ${feed ? feed.name : 'Unknown Feed'}<br>
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
    container.innerHTML = appState.feeds.map(feed => `
        <div class="feed-mgmt-item">
            <div class="feed-mgmt-info">
                <strong>${feed.name}</strong><br>
                <small>${feed.url}</small>
            </div>
            <div class="feed-mgmt-controls">
                <button class="mgmt-btn" onclick="editFeed('${feed.id}')">Edit</button>
                <button class="mgmt-btn danger" onclick="removeFeed('${feed.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Theme Management
function changeTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    appState.currentTheme = themeName;
    document.getElementById('theme-selector').value = themeName;
    saveFeedData();
}

// Tab Management
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`panel-${tabId}`).classList.add('active');
    
    appState.activeTab = tabId;
}

// Data Persistence
function saveFeedData() {
    try {
        localStorage.setItem('rss-aggregator-data', JSON.stringify({
            feeds: appState.feeds,
            groups: appState.groups,
            articles: appState.articles,
            currentTheme: appState.currentTheme,
            sidebarVisible: appState.sidebarVisible
        }));
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

function loadFeedData() {
    try {
        const saved = localStorage.getItem('rss-aggregator-data');
        if (saved) {
            const data = JSON.parse(saved);
            appState.feeds = data.feeds || appState.feeds;
            appState.groups = data.groups || appState.groups;
            appState.articles = data.articles || appState.articles;
            appState.currentTheme = data.currentTheme || appState.currentTheme;
            appState.sidebarVisible = data.sidebarVisible !== undefined ? data.sidebarVisible : appState.sidebarVisible;
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Modal Management
function showModal(title, content, onOk = null) {
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
}

function hideModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadFeedData();
    
    // Initialize UI
    changeTheme(appState.currentTheme);
    updateFeedTree();
    updateArticlesList();
    updateArticleReader();
    updateGroupSelect();
    updateFeedManagement();
    
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
            const group = appState.groups.find(g => g.id === groupHeader.closest('.feed-group').dataset.group);
            if (group) {
                group.expanded = !group.expanded;
                updateFeedTree();
                saveFeedData();
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
            
            // Mark as read
            const article = appState.articles.find(a => a.id === appState.selectedArticle);
            if (article && !article.read) {
                article.read = true;
                const feed = appState.feeds.find(f => f.id === article.feedId);
                if (feed) feed.unreadCount = Math.max(0, feed.unreadCount - 1);
                updateFeedTree();
                updateSidebarStatus();
                saveFeedData();
            }
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
    document.getElementById('add-feed-btn').addEventListener('click', () => {
        const url = document.getElementById('feed-url').value.trim();
        const name = document.getElementById('feed-name').value.trim();
        const group = document.getElementById('feed-group').value;
        
        if (url) {
            addFeed(url, name, group);
            document.getElementById('feed-url').value = '';
            document.getElementById('feed-name').value = '';
            showNotification('Feed added successfully');
        } else {
            alert('Please enter a valid RSS URL');
        }
    });
    
    document.getElementById('create-group-btn').addEventListener('click', () => {
        const groupName = document.getElementById('new-group').value.trim();
        if (groupName) {
            addGroup(groupName);
            document.getElementById('new-group').value = '';
        } else {
            alert('Please enter a group name');
        }
    });
    
    // Search functionality
    document.getElementById('search-articles').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const articles = document.querySelectorAll('.article-item');
        
        articles.forEach(article => {
            const title = article.querySelector('.article-title').textContent.toLowerCase();
            const preview = article.querySelector('.article-preview').textContent.toLowerCase();
            const matches = title.includes(searchTerm) || preview.includes(searchTerm);
            article.style.display = matches ? 'block' : 'none';
        });
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) hideModal();
    });
    
    // Reader controls delegation
    document.getElementById('article-reader').addEventListener('click', (e) => {
        if (e.target.id === 'open-original') {
            const article = appState.articles.find(a => a.id === appState.selectedArticle);
            if (article) {
                require('electron').shell.openExternal(article.link);
            }
        } else if (e.target.id === 'mark-read') {
            const article = appState.articles.find(a => a.id === appState.selectedArticle);
            if (article) {
                article.read = !article.read;
                const feed = appState.feeds.find(f => f.id === article.feedId);
                if (feed) {
                    feed.unreadCount += article.read ? -1 : 1;
                    feed.unreadCount = Math.max(0, feed.unreadCount);
                }
                updateFeedTree();
                updateArticlesList();
                updateArticleReader();
                updateSidebarStatus();
                saveFeedData();
            }
        } else if (e.target.id === 'save-article') {
            const article = appState.articles.find(a => a.id === appState.selectedArticle);
            if (article) {
                article.saved = !article.saved;
                updateArticleReader();
                saveFeedData();
                showNotification(article.saved ? 'Article saved' : 'Article unsaved');
            }
        }
    });
    
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
    });
    
    // Periodic updates
    setInterval(() => {
        const now = new Date();
        const memoryUsage = `Memory: ${Math.floor(Math.random() * 20 + 40)}MB`;
        document.getElementById('memory-usage').textContent = memoryUsage;
        
        // Auto-refresh feeds every 30 minutes
        const lastRefresh = localStorage.getItem('last-auto-refresh');
        if (!lastRefresh || (now - new Date(lastRefresh)) > 30 * 60 * 1000) {
            refreshAllFeeds();
            localStorage.setItem('last-auto-refresh', now.toISOString());
        }
    }, 5000);
    
    // Network status
    function updateConnectionStatus() {
        const status = navigator.onLine ? 'Online' : 'Offline';
        document.getElementById('connection-status').textContent = status;
    }
    
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    console.log('Retro RSS Aggregator initialized');
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

window.removeFeed = function(feedId) {
    if (confirm('Are you sure you want to remove this feed?')) {
        removeFeed(feedId);
        updateFeedManagement();
    }
};
