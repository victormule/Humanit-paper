(function () {
    "use strict";

    function sleep(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function getTemplateHtml(template) {
        if (!template) return "";
        return template.innerHTML.trim();
    }

    function readNumber(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function escapeHtmlChar(char) {
        switch (char) {
            case "&": return "&amp;";
            case "<": return "&lt;";
            case ">": return "&gt;";
            case '"': return "&quot;";
            case "'": return "&#39;";
            default: return char;
        }
    }

    function isTagStart(html, index) {
        return html[index] === "<";
    }

    function readTag(html, startIndex) {
        const endIndex = html.indexOf(">", startIndex);

        if (endIndex === -1) {
            return {
                token: html.slice(startIndex),
                nextIndex: html.length
            };
        }

        return {
            token: html.slice(startIndex, endIndex + 1),
            nextIndex: endIndex + 1
        };
    }

    function createCaret() {
        const caret = document.createElement("span");
        caret.className = "typing-caret";
        caret.textContent = "|";
        return caret;
    }

    async function typeHtmlContent(target, html, options) {
        const speed = Math.max(0, readNumber(options.speed, 1));
        const startDelay = Math.max(0, readNumber(options.startDelay, 0));
        const chunkSize = Math.max(1, Math.floor(readNumber(options.chunkSize, 6)));

        target.innerHTML = "";

        const contentNode = document.createElement("span");
        const caretNode = createCaret();

        target.appendChild(contentNode);
        target.appendChild(caretNode);

        if (startDelay > 0) {
            await sleep(startDelay);
        }

        let output = "";
        let index = 0;

        while (index < html.length) {
            if (isTagStart(html, index)) {
                const { token, nextIndex } = readTag(html, index);
                output += token;
                index = nextIndex;
                contentNode.innerHTML = output;
                continue;
            }

            let typedCount = 0;

            while (
                index < html.length &&
                typedCount < chunkSize &&
                !isTagStart(html, index)
            ) {
                output += escapeHtmlChar(html[index]);
                index += 1;
                typedCount += 1;
            }

            contentNode.innerHTML = output;

            if (speed > 0) {
                await sleep(speed);
            } else {
                await new Promise((resolve) => requestAnimationFrame(resolve));
            }
        }

        caretNode.remove();
    }

    async function initArticleTyping() {
        const articleBody = document.getElementById("article-body");
        const template = document.getElementById("article-content-template");

        if (!articleBody || !template) return;

        const html = getTemplateHtml(template);

        await typeHtmlContent(articleBody, html, {
            speed: articleBody.dataset.typingSpeed || 1,
            startDelay: articleBody.dataset.typingStartDelay || 50,
            chunkSize: articleBody.dataset.typingChunkSize || 6
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initArticleTyping, { once: true });
    } else {
        initArticleTyping();
    }
})();