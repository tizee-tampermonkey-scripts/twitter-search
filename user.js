// ==UserScript==
// @name         Twitter/X Advanced Search Builder
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Build advanced Twitter/X search queries via a polished UI with native search integration and draggable positioning.
// @author       tizee
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- Style definitions ---
    GM_addStyle(`
        /* CSS variables matching Twitter design system */
        :root {
            --twitter-blue: #1d9bf0;
            --twitter-blue-hover: #1a8cd8;
            --twitter-blue-disabled: #1e3a8a;
            --bg-primary: rgba(15, 20, 25, 0.95);
            --bg-secondary: rgba(15, 20, 25, 0.8);
            --border-color: rgba(255, 255, 255, 0.1);
            --text-primary: #f7f9f9;
            --text-secondary: #e7e9ea;
            --text-tertiary: #71767b;
            --success-color: #00ba7c;
            --error-color: #f4212e;
            --hover-bg: rgba(255, 255, 255, 0.03);
            --glass-blur: blur(20px);
            --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #search-builder-container {
            position: fixed;
            top: 10px;
            left: 10px;
            right: auto;
            transform: none;
            background: var(--bg-primary);
            backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 20px;
            z-index: 9999;
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            width: 380px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            user-select: none;
            transition: var(--transition);
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        #search-builder-container.minimized {
            padding: 12px 20px;
            min-height: 48px;
        }

        #search-builder-container.minimized #search-builder-header {
            padding-bottom: 0;
            border-bottom: none;
            margin-bottom: 0;
        }

        #search-builder-container.minimized #search-builder-form {
            display: none;
        }

        #search-builder-header {
            cursor: move;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #search-builder-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            flex: 1;
        }

        .search-builder-actions {
            display: flex;
            gap: 8px;
        }

        .search-builder-btn-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
            font-size: 16px;
        }

        .search-builder-btn-icon:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
        }

        .search-builder-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }

        .search-builder-row label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .search-builder-row input[type="text"],
        .search-builder-row input[type="date"],
        .search-builder-row input[type="number"] {
            width: 100%;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            padding: 10px 12px;
            font-size: 15px;
            transition: var(--transition);
        }

        .search-builder-row input:focus {
            outline: none;
            border-color: var(--twitter-blue);
            background: rgba(15, 20, 25, 0.9);
            box-shadow: 0 0 0 1px var(--twitter-blue);
        }

        .search-builder-row input::placeholder {
            color: var(--text-tertiary);
        }

        .search-builder-media-filters {
            display: flex;
            gap: 16px;
            padding: 8px 0;
        }

        .search-builder-media-filters label {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-weight: 400;
            color: var(--text-secondary);
            transition: var(--transition);
        }

        .search-builder-media-filters label:hover {
            color: var(--text-primary);
        }

        .search-builder-media-filters input[type="checkbox"] {
            width: 18px;
            height: 18px;
            border-radius: 4px;
            border: 2px solid var(--text-tertiary);
            background: transparent;
            cursor: pointer;
            accent-color: var(--twitter-blue);
        }

        .search-builder-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            gap: 12px;
        }

        .search-builder-btn {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-weight: 700;
            font-size: 15px;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        #generate-search-btn {
            background-color: var(--twitter-blue);
            color: white;
        }

        #generate-search-btn:hover:not(:disabled) {
            background-color: var(--twitter-blue-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(29, 155, 240, 0.3);
        }

        #generate-search-btn:disabled {
            background-color: var(--twitter-blue-disabled);
            cursor: not-allowed;
            transform: none;
        }

        #clear-search-btn {
            background: var(--bg-secondary);
            color: var(--text-secondary);
        }

        #clear-search-btn:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
        }

        #copy-search-btn {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 14px;
            margin-left: 8px;
        }

        #copy-search-btn:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
        }

        .search-builder-toast {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transition: var(--transition);
            pointer-events: none;
        }

        .search-builder-toast.show {
            opacity: 1;
            bottom: -50px;
        }

        .search-builder-error {
            border-color: var(--error-color) !important;
            background: rgba(244, 33, 46, 0.05) !important;
        }

        .search-builder-error-message {
            color: var(--error-color);
            font-size: 12px;
            margin-top: 4px;
            display: none;
        }

        .search-builder-error-message.show {
            display: block;
        }

        .search-builder-toggle-icon {
            font-size: 20px;
            font-weight: bold;
        }
    `);

    // --- UI creation ---
    function createSearchBuilder() {
        const container = document.createElement('div');
        container.id = 'search-builder-container';

        // Header
        const header = document.createElement('div');
        header.id = 'search-builder-header';

        const title = document.createElement('h3');
        title.textContent = 'Advanced Search Builder';

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'search-builder-actions';

        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-btn';
        minimizeBtn.className = 'search-builder-btn-icon';
        minimizeBtn.title = 'Minimize';
        minimizeBtn.textContent = '−';

        actionsDiv.appendChild(minimizeBtn);
        header.appendChild(title);
        header.appendChild(actionsDiv);

        // Form
        const form = document.createElement('div');
        form.id = 'search-builder-form';

        // Exact phrase
        form.appendChild(createFormGroup('sb-exact-phrase', 'Exact phrase', 'text', 'e.g., the future of AI', true));

        // Any of these words
        form.appendChild(createFormGroup('sb-any-words', 'Any of these words', 'text', 'Use OR, e.g., apple OR google', true));

        // Exclude words
        form.appendChild(createFormGroup('sb-exclude-word', 'Exclude words', 'text', 'e.g., fruit', false));

        // From account
        form.appendChild(createFormGroup('sb-from-user', 'From account', 'text', 'No @, e.g., x', true));

        // Since date
        form.appendChild(createFormGroup('sb-since-date', 'Since date', 'date', '', false));

        // Until date
        form.appendChild(createFormGroup('sb-until-date', 'Until date', 'date', '', false));

        // Date error message
        const dateError = document.createElement('div');
        dateError.id = 'sb-date-error';
        dateError.className = 'search-builder-error-message';
        dateError.textContent = 'End date cannot be earlier than start date';
        form.appendChild(dateError);

        // Media filters
        const mediaRow = document.createElement('div');
        mediaRow.className = 'search-builder-row';

        const mediaLabel = document.createElement('label');
        mediaLabel.textContent = 'Media filters';

        const mediaFilters = document.createElement('div');
        mediaFilters.className = 'search-builder-media-filters';

        const linksCheckbox = createCheckbox('sb-filter-links', 'Has links');
        const mediaCheckbox = createCheckbox('sb-filter-media', 'Has media');

        mediaFilters.appendChild(linksCheckbox);
        mediaFilters.appendChild(mediaCheckbox);
        mediaRow.appendChild(mediaLabel);
        mediaRow.appendChild(mediaFilters);
        form.appendChild(mediaRow);

        // Button group
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'search-builder-buttons';

        const clearBtn = document.createElement('button');
        clearBtn.id = 'clear-search-btn';
        clearBtn.className = 'search-builder-btn';
        clearBtn.textContent = 'Clear';

        const actionButtonsDiv = document.createElement('div');

        const generateBtn = document.createElement('button');
        generateBtn.id = 'generate-search-btn';
        generateBtn.className = 'search-builder-btn';
        generateBtn.textContent = 'Build & search';

        const copyBtn = document.createElement('button');
        copyBtn.id = 'copy-search-btn';
        copyBtn.className = 'search-builder-btn';
        copyBtn.textContent = 'Copy query';

        actionButtonsDiv.appendChild(generateBtn);
        actionButtonsDiv.appendChild(copyBtn);
        buttonsDiv.appendChild(clearBtn);
        buttonsDiv.appendChild(actionButtonsDiv);
        form.appendChild(buttonsDiv);

        // Toast
        const toast = document.createElement('div');
        toast.id = 'search-builder-toast';
        toast.className = 'search-builder-toast';

        container.appendChild(header);
        container.appendChild(form);
        container.appendChild(toast);

        document.body.appendChild(container);

        return {
            container,
            header,
            minimizeBtn,
            toast
        };
    }

    // Helper: create form group
    function createFormGroup(id, labelText, type, placeholder, hasError) {
        const row = document.createElement('div');
        row.className = 'search-builder-row';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.placeholder = placeholder;

        row.appendChild(label);
        row.appendChild(input);

        if (hasError) {
            const errorDiv = document.createElement('div');
            errorDiv.id = `${id}-error`;
            errorDiv.className = 'search-builder-error-message';

            if (id === 'sb-exact-phrase') {
                errorDiv.textContent = 'Please enter a valid phrase';
            } else if (id === 'sb-any-words') {
                errorDiv.textContent = 'Please separate words with OR';
            } else if (id === 'sb-from-user') {
                errorDiv.textContent = 'Please enter a valid username';
            }

            row.appendChild(errorDiv);
        }

        return row;
    }

    // Helper: create checkbox
    function createCheckbox(id, labelText) {
        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;

        const span = document.createElement('span');
        span.textContent = labelText;

        label.appendChild(checkbox);
        label.appendChild(span);

        return label;
    }

    // --- Initialize UI ---
    const uiElements = createSearchBuilder();
    const container = uiElements.container;
    const header = uiElements.header;
    const minimizeBtn = uiElements.minimizeBtn;
    const toast = uiElements.toast;

    // --- Draggable window ---
    const defaultTransition = getComputedStyle(container).transition;
    let isDragging = false;
    let offsetX, offsetY;
    let dragRafId = null;
    let pendingX = 0;
    let pendingY = 0;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Switch from right/transform positioning to left/top positioning
        const rect = container.getBoundingClientRect();
        container.style.right = 'auto';
        container.style.transform = 'none';
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.top}px`;

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        container.style.cursor = 'grabbing';
        container.style.transition = 'none';
        container.style.willChange = 'left, top';
        e.preventDefault();
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        pendingX = e.clientX - offsetX;
        pendingY = e.clientY - offsetY;
        if (dragRafId) return;
        dragRafId = requestAnimationFrame(() => {
            container.style.left = `${pendingX}px`;
            container.style.top = `${pendingY}px`;
            dragRafId = null;
        });
    }

    // Edge snapping threshold in pixels
    const SNAP_THRESHOLD = 30;
    const SNAP_MARGIN = 10;

    function snapToEdge() {
        const rect = container.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newLeft = rect.left;
        let newTop = rect.top;

        // Snap to left edge
        if (rect.left < SNAP_THRESHOLD) {
            newLeft = SNAP_MARGIN;
        }
        // Snap to right edge
        else if (viewportWidth - rect.right < SNAP_THRESHOLD) {
            newLeft = viewportWidth - rect.width - SNAP_MARGIN;
        }

        // Snap to top edge
        if (rect.top < SNAP_THRESHOLD) {
            newTop = SNAP_MARGIN;
        }
        // Snap to bottom edge
        else if (viewportHeight - rect.bottom < SNAP_THRESHOLD) {
            newTop = viewportHeight - rect.height - SNAP_MARGIN;
        }

        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
    }

    function dockToLeftTop() {
        const rect = container.getBoundingClientRect();
        const newLeft = SNAP_MARGIN;
        const newTop = SNAP_MARGIN;

        container.style.right = 'auto';
        container.style.transform = 'none';
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
    }

    function onMouseUp() {
        isDragging = false;
        container.style.cursor = 'grab';
        if (dragRafId) {
            cancelAnimationFrame(dragRafId);
            dragRafId = null;
            container.style.left = `${pendingX}px`;
            container.style.top = `${pendingY}px`;
        }
        container.style.transition = defaultTransition;
        container.style.willChange = '';
        // Snap after dragging
        if (isMinimized) {
            dockToLeftTop();
        } else {
            snapToEdge();
        }
        // Save position
        GM_setValue('searchBuilderTop', container.style.top);
        GM_setValue('searchBuilderLeft', container.style.left);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // --- Minimize/Expand functionality ---
    let isMinimized = true; // Default to collapsed

    // Initialize collapsed state and dock to right-top
    container.classList.add('minimized');
    minimizeBtn.textContent = '+';
    minimizeBtn.title = 'Expand';
    requestAnimationFrame(() => {
        dockToLeftTop();
        GM_setValue('searchBuilderLeft', container.style.left);
        GM_setValue('searchBuilderTop', container.style.top);
    });

    minimizeBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;

        // Convert to left/top positioning before changing state
        const rect = container.getBoundingClientRect();
        container.style.right = 'auto';
        container.style.transform = 'none';
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.top}px`;

        if (isMinimized) {
            container.classList.add('minimized');
            minimizeBtn.textContent = '+';
            minimizeBtn.title = 'Expand';
        } else {
            container.classList.remove('minimized');
            minimizeBtn.textContent = '−';
            minimizeBtn.title = 'Minimize';
        }

        // Reposition after state change to adjust for new size
        requestAnimationFrame(() => {
            if (isMinimized) {
                dockToLeftTop();
            } else {
                snapToEdge();
            }
            GM_setValue('searchBuilderLeft', container.style.left);
            GM_setValue('searchBuilderTop', container.style.top);
        });
    });

    // --- Input validation ---
    function validateInputs() {
        let isValid = true;
        const sinceDate = document.getElementById('sb-since-date').value;
        const untilDate = document.getElementById('sb-until-date').value;
        const fromUser = document.getElementById('sb-from-user').value.trim();
        const anyWords = document.getElementById('sb-any-words').value.trim();

        // Date validation
        if (sinceDate && untilDate && new Date(untilDate) < new Date(sinceDate)) {
            showError('sb-date-error');
            isValid = false;
        } else {
            hideError('sb-date-error');
        }

        // Username validation
        if (fromUser && /[@#$%^&*()+=\[\]{};':"\\|,.<>\/?]/.test(fromUser)) {
            showError('sb-from-user-error');
            isValid = false;
        } else {
            hideError('sb-from-user-error');
        }

        // OR words validation
        if (anyWords && anyWords.includes('OR') && anyWords.split('OR').some(word => word.trim().length === 0)) {
            showError('sb-any-words-error');
            isValid = false;
        } else {
            hideError('sb-any-words-error');
        }

        return isValid;
    }

    function showError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('show');
            // Highlight the corresponding input
            const inputId = errorId.replace('-error', '');
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.classList.add('search-builder-error');
            }
        }
    }

    function hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
            // Remove highlight
            const inputId = errorId.replace('-error', '');
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.classList.remove('search-builder-error');
            }
        }
    }

    // --- Toast notifications ---
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.classList.add('show');

        if (type === 'success') {
            toast.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            toast.style.background = 'var(--error-color)';
        } else {
            toast.style.background = 'rgba(0, 0, 0, 0.9)';
        }

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // --- Core logic ---

    /**
     * Build search string from form inputs
     * @returns {string} - Combined search query string
     */
    function buildSearchString() {
        const parts = [];

        const exactPhrase = document.getElementById('sb-exact-phrase').value.trim();
        if (exactPhrase) parts.push(`"${exactPhrase}"`);

        const anyWords = document.getElementById('sb-any-words').value.trim();
        if (anyWords) {
            // Ensure OR has spaces on both sides
            const formattedWords = anyWords.replace(/\s*OR\s*/g, ' OR ');
            parts.push(`(${formattedWords})`);
        }

        const excludeWord = document.getElementById('sb-exclude-word').value.trim();
        if (excludeWord) parts.push(`-${excludeWord}`);

        const fromUser = document.getElementById('sb-from-user').value.trim();
        if (fromUser) parts.push(`from:${fromUser}`);

        const sinceDate = document.getElementById('sb-since-date').value;
        if (sinceDate) parts.push(`since:${sinceDate}`);

        const untilDate = document.getElementById('sb-until-date').value;
        if (untilDate) parts.push(`until:${untilDate}`);

        if (document.getElementById('sb-filter-links').checked) parts.push('filter:links');
        if (document.getElementById('sb-filter-media').checked) parts.push('filter:media');

        return parts.join(' ');
    }

    /**
     * Execute search
     * @param {string} searchString - The search query to execute
     */
    function performSearch(searchString) {
        if (!searchString) {
            showToast('Please enter search criteria', 'error');
            return;
        }

        // Try to interact with native search box
        const searchInput = document.querySelector('input[data-testid="SearchBox_Search_Input"]');
        if (searchInput) {
            searchInput.value = searchString;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Try to find and click search button
            const searchButton = document.querySelector('button[data-testid="SearchBox_Search_Button"]');
            if (searchButton) {
                searchButton.click();
                showToast('Search executed', 'success');
            } else {
                // If search button not found, press Enter
                searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                showToast('Search executed', 'success');
            }
        } else {
            // Fallback: navigate directly to search results page
            window.location.href = `https://twitter.com/search?q=${encodeURIComponent(searchString)}&src=typed_query`;
        }
    }

    /**
     * Copy search string to clipboard
     */
    function copySearchString() {
        const searchString = buildSearchString();
        if (!searchString) {
            showToast('Please enter search criteria', 'error');
            return;
        }

        navigator.clipboard.writeText(searchString).then(() => {
            showToast('Search query copied to clipboard', 'success');
        }).catch(() => {
            // Fallback: use textarea to copy
            const textArea = document.createElement('textarea');
            textArea.value = searchString;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Search query copied to clipboard', 'success');
        });
    }

    // --- Input event listeners (real-time validation) ---
    document.getElementById('sb-since-date').addEventListener('change', validateInputs);
    document.getElementById('sb-until-date').addEventListener('change', validateInputs);
    document.getElementById('sb-from-user').addEventListener('input', validateInputs);
    document.getElementById('sb-any-words').addEventListener('input', validateInputs);

    // --- Button event listeners ---
    document.getElementById('generate-search-btn').addEventListener('click', () => {
        if (validateInputs()) {
            const searchString = buildSearchString();
            performSearch(searchString);
        } else {
            showToast('Please check input errors', 'error');
        }
    });

    document.getElementById('clear-search-btn').addEventListener('click', () => {
        const form = document.getElementById('search-builder-form');
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'date') {
                input.value = '';
            } else if (input.type === 'checkbox') {
                input.checked = false;
            }
        });

        // Clear all error messages
        document.querySelectorAll('.search-builder-error-message').forEach(error => {
            error.classList.remove('show');
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('search-builder-error');
        });
        showToast('All inputs cleared', 'info');
    });

    document.getElementById('copy-search-btn').addEventListener('click', () => {
        if (validateInputs()) {
            copySearchString();
        } else {
            showToast('Please check input errors', 'error');
        }
    });

})();
