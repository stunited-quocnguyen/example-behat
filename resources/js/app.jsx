import { Inertia } from "@inertiajs/inertia";
import { createInertiaApp } from "@inertiajs/inertia-react";
import { InertiaProgress } from "@inertiajs/progress";
import NProgress from "nprogress";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Home from "./pages/Home";

let timeout = null;

InertiaProgress.init({
    delay: 250,
    color: "#95e",
    includeCSS: true,
    showSpinner: true,
});

Inertia.on("start", () => {
    timeout = setTimeout(() => NProgress.start(), 250);
});

Inertia.on("progress", (event) => {
    if (NProgress.isStarted() && event.detail.progress.percentage) {
        NProgress.set((event.detail.progress.percentage / 100) * 0.9);
    }
});

Inertia.on("finish", (event) => {
    clearTimeout(timeout);
    if (!NProgress.isStarted()) {
        return;
    } else if (event.detail.visit.completed) {
        NProgress.done();
    } else if (event.detail.visit.interrupted) {
        NProgress.set(0);
    } else if (event.detail.visit.cancelled) {
        NProgress.done();
        NProgress.remove();
    }
});

createInertiaApp({
    // eslint-disable-next-line require-await
    resolve: async (name) => {
        const pages = import.meta.globEager(`./pages/**/*.jsx`);
        const page = pages[`./pages/${name}.jsx`].default;

        if (/^Auth\//.test(name)) {
            return page;
        }

        if (page.layout === undefined) {
            page.layout = Home;
        }

        return page;
    },
    setup({ el, App, props }) {
        render(
            <Router>
                <App {...props} />
            </Router>,
            el
        );
    },
});
