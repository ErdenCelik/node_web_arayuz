"use strict";

var detectionStream = function () {
    var wsUrl = 'ws://localhost:1000';
    var modalEl;
    var modal;
    var status;
    var feed;
    var ws = null;
    var retryCount = 0;
    var maxRetries = 5;
    var retryDelay = 3000;
    var viewerCount;

    var initModal = function() {
        modalEl = document.getElementById('detectionStream');
        if (!modalEl) {
            return;
        }
        modal = new bootstrap.Modal(modalEl);
        status = document.getElementById('streamStatus');
        feed = document.getElementById('streamFeed');
        viewerCount = document.getElementById('viewerCount');

        var closeBtn = modalEl.querySelector('[data-bs-dismiss="modal"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    };

    var initButtons = function() {
        var openBtn = document.getElementById('openStreamBtn');
        if (openBtn) {
            openBtn.addEventListener('click', openModal);
        }
    };

    var connect = function() {
        ws = new WebSocket(wsUrl);

        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'frame') {
                    feed.src = 'data:image/jpeg;base64,' + data.data;
                }else if (data.type === 'viewer_count') {
                    updateViewerCount(data.count);
                }
            } catch (e) {
                console.error('Frame parse error:', e);
            }
        };

        ws.onopen = function() {
            setStatus('Sunucuya bağlandı', 'connected');
            retryCount = 0;
        };

        ws.onclose = function() {
            setStatus('Bağlantı kesildi', 'disconnected');
            updateViewerCount(0);

            if (modalEl.style.display === 'block') {
                retryConnection();
            }
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            setStatus('Bağlantı hatası', 'disconnected');
        };
    };
    var updateViewerCount = function(count) {
        if (viewerCount) {
            viewerCount.textContent = count + ' izleyici';
        }
    };

    var retryConnection = function() {
        if (retryCount < maxRetries) {
            setStatus(`Yeniden bağlanılıyor... (${retryCount + 1}/${maxRetries})`, 'disconnected');
            setTimeout(function() {
                retryCount++;
                connect();
            }, retryDelay);
        } else {
            setStatus('Bağlantı başarısız - Lütfen sayfayı yenileyin', 'disconnected');
        }
    };

    var setStatus = function(message, className) {
        if (status) {
            status.textContent = message;
            status.className = 'stream-status ' + className;
        }
    };

    var openModal = function() {
        if (modal) {
            modalEl.style.display = 'block';
            modal.show();
            connect();
        }
    };

    var closeModal = function() {
        if (modal) {
            if (ws) {
                console.log("Kapanıyor ws")
                ws.close();
                ws = null;
            }
            retryCount = 0;
            if (feed) {
                feed.src = '';
            }
            modalEl.style.display = 'none';
            modal.hide();
        }
    };

    return {
        init: function(config) {
            if (config) {
                wsUrl = config.wsUrl || wsUrl;
                maxRetries = config.maxRetries || maxRetries;
                retryDelay = config.retryDelay || retryDelay;
            }

            initModal();
            initButtons();
        }
    };
}();

// Initialize when DOM is ready
KTUtil.onDOMContentLoaded(function() {
    detectionStream.init({
        wsUrl: `ws://${window.APP_CONFIG.pyHost}:${window.APP_CONFIG.wsPort}`,
        maxRetries: 5,
        retryDelay: 3000
    });
});