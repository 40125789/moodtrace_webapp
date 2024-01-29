class LandingNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg bg-info navbar-dark">
                <div class="container">
                    <a href="/" class="navbar-brand" style="font-weight: bold">Mood Trace</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navmenu">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navmenu">
                        <!-- New ul for Login and Register links on the far right with custom styles -->
                        <ul class="navbar-nav" style="margin-left: auto;">
                            <li class="nav-item">
                                <a href="/register" class="nav-link"><i class="fa-solid fa-user"></i> Register</a>
                            </li>
                            <li class="nav-item">
                                <a href="/login" class="nav-link"><i class="fa-solid fa-right-to-bracket"></i> Log in</a>
                            </li>
                        </ul>
                        
                    </div>
                </div>
            </nav>`;
    }
}

customElements.define('my-landnavbar', LandingNav);
