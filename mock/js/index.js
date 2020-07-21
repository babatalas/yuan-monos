(async () => {
    const initialState = {
        notification: {
            isClosed: false,
        },
        newsletter: {
            isClosed: false,
            timeClosed: null,
            isSubmit: false,
        },
    };
    const sessionState = await JSON.parse(sessionStorage.getItem("cermatiApp"));
    const appState = sessionState || initialState;
    window.appState = appState;

    window.addEventListener("beforeunload", () => {
        appStateReset(appState);
        sessionStorage.setItem("cermatiApp", JSON.stringify(appState));
    });

    document.addEventListener("readystatechange", (event) => {
        if (event.target.readyState === "interactive") {
            console.log("loading...");
        } else if (event.target.readyState === "complete") {
            if (appState.newsletter.isClosed) {
                const expired = appState.newsletter.timeClosed + 600000;
                const currentTime = Date.now();
                if (currentTime > expired) {
                    appState.newsletter = {
                        ...appState.newsletter,
                        isClosed: false,
                        timeClosed: null,
                    };
                }
            }
            initApp(appState);
            console.log("document ready");
        }
    });
})();

function initApp(appState) {
    const elements = [];

    elements["notification"] = document.querySelector(".notification");
    elements["notificationButton"] = document.querySelector(
        ".notification__button"
    );
    elements["newsletter"] = document.querySelector(".newsletter");
    elements["newsletterContainer"] = document.querySelector(
        ".newsletter__container"
    );
    elements["newsletterCloseBtn"] = document.querySelector(
        ".u-newsletter-close"
    );
    elements["newsletterForm"] = document.querySelector(".newsletter__form");
    elements["inputEmail"] = document.querySelector("#inputEmail");

    if (!appState.notification.isClosed) {
        elements["notificationButton"].addEventListener("click", () => {
            closeNotification(elements, appState);
        });
    } else {
        elements["notification"].setAttribute("style", "display: none;");
    }

    if (!appState.newsletter.isClosed) {
        elements["newsletterCloseBtn"].addEventListener("click", () => {
            closeNewsletter(elements, appState);
        });

        elements["newsletterForm"].addEventListener("submit", (event) => {
            event.preventDefault();
            // Handle submit form
            const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailReg.test(elements["inputEmail"].value)) {
                closeNewsletter(elements, appState);
            } else if (!appState.newsletter.isSubmit) {
                const p = document.createElement("p");
                const newsletterContainer = document.querySelector(
                    ".newsletter__container"
                );
                p.append("Email is not valid");
                newsletterContainer.append(p);
                appState.newsletter.isSubmit = true;
                console.log("email not valid");
            }
        });

        window.addEventListener("scroll", newsletterSlideUp);
    } else {
        elements["newsletter"].setAttribute("style", "display: none;");
    }
}

function newsletterSlideUp(params) {
    const pageHeight = document.querySelector("body").getClientRects()[0]
        .height;
    const viewportY = window.innerHeight;
    const scrollY = window.scrollY;
    const newsletterHit = Math.round((pageHeight * 2) / 3);

    if (scrollY + viewportY > newsletterHit) {
        console.log("newsletterHit");
        window.removeEventListener("scroll", newsletterSlideUp);
        openNewsletter();
    }
}

function closeNotification(elements, appState) {
    const notificationElement = elements["notification"];
    const notificationStyle = notificationElement.style;
    const notificationHeight = notificationElement.getClientRects()[0].bottom;

    notificationStyle["transition"] = "all 1s linear";
    notificationStyle["transform"] = `translateY(-${notificationHeight}px)`;
    notificationStyle["margin-top"] = `-${notificationHeight}px`;
    notificationStyle["opacity"] = 0;
    hideElement(notificationElement, 1000);

    appState.notification = {
        ...appState.notification,
        isClosed: true,
    };
}

function openNewsletter() {
    const newsletterElement = document.querySelector(".newsletter");
    const newsletterContainerElement = document.querySelector(
        ".newsletter__container"
    );
    const newsletterStyle = newsletterContainerElement.style;
    showElement(newsletterElement);
    const newsletterHeight = newsletterContainerElement.getClientRects()[0]
        .height;

    newsletterStyle["bottom"] = `-${newsletterHeight}px`;
    setTimeout(() => {
        newsletterStyle["transition"] = "all 1s linear";
        newsletterStyle["transform"] = `translateY(-${newsletterHeight}px)`;
        newsletterStyle["opacity"] = 1;
    }, 1000);
}

function closeNewsletter(elements, appState) {
    const newsletterElement = elements["newsletter"];
    const newsletterContainerElement = elements["newsletterContainer"];
    const newsletterStyle = newsletterContainerElement.style;
    const newsletterHeight = newsletterContainerElement.getClientRects()[0]
        .height;

    newsletterStyle["transition"] = "all 2s linear";
    newsletterStyle["transform"] = `translateY(${newsletterHeight}px)`;
    newsletterStyle["opacity"] = 0;
    hideElement(newsletterElement, 1000);

    appState.newsletter = {
        ...appState.newsletter,
        isClosed: true,
        timeClosed: Date.now(),
    };
}

function hideElement(el, ms) {
    setTimeout(() => {
        el.setAttribute("style", "display: none;");
    }, ms);
}

function showElement(el) {
    el.setAttribute("style", "display: block;");
}

function appStateReset(state) {
    state.newsletter = {
        ...appState.newsletter,
        isSubmit: false,
    };
}
