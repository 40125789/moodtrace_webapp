class MyNavBar extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg bg-info navbar-dark">
                <div class="container">
                    <a href="/" class="navbar-brand" style="font-weight: bold">Mood Trace</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navmenu">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navmenu">
                        <ul class="navbar-nav">
                            <li class="nav-item ${currentPath === '/dashboard' ? 'active' : ''}" >
                                <a href="/dashboard" class="nav-link"><i class="fas fa-home"></i> Home</a>
                            </li>
                            <li class="nav-item ${currentPath === '/record' ? 'active' : ''}" >
                                <a href="/record" class="nav-link"><i class="fas fa-book"></i> Record</a>
                            </li>
                            <li class="nav-item ${currentPath === '/history' ? 'active' : ''}" >
                                <a href="/history" class="nav-link"><i class="fas fa-history"></i> History</a>
                            </li>
                            <li class="nav-item ${currentPath === '/statistics' ? 'active' : ''}">
                                <a href="/statistics" class="nav-link"><i class="fas fa-chart-line"></i> Trends</a>
                            </li>
                        </ul>
                        
                        <!-- New ul for Login and Register links on the far right with custom styles -->
                        <ul class="navbar-nav" style="margin-left: auto;">
                            <li class="nav-item">
                                <a href="/index" class="nav-link"><i class="fa-solid fa-right-to-bracket"></i> Log out</a>
                            </li>
                        </ul>
                        
                    </div>
                </div>
            </nav>`;
    }
}

customElements.define('my-navbar', MyNavBar);