/* =====================================================
   MISE À L'ÉCHELLE
   --
   Calcule --u en fonction de la largeur du viewport.
   Appelée au load, resize, et après chargement polices.
   ===================================================== */
function updateJournalScale() {
    const root = document.documentElement;
    const viewport = document.querySelector('.viewport');
    if (!viewport) return;
    const baseWidth = 1300;
    const viewportWidth = viewport.clientWidth;
    const unit = viewportWidth / baseWidth;
    root.style.setProperty('--u', `${unit}px`);
}

window.addEventListener('resize', updateJournalScale);

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateJournalScale);
}

/* =====================================================
   UTILITAIRES
   ===================================================== */

/* Promesse retardée (anciennement delay() et wait() — unifiés) */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* =====================================================
   SÉQUENCE CINÉMATOGRAPHIQUE
   ===================================================== */

/* -- Prépare le grand titre: enveloppe chaque lettre dans un span -- */
function prepareTitre() {
    const el = document.getElementById('grand-titre');
    /* Mémorise le texte original pour pouvoir le rejouer après traduction */
    const text = el.dataset.original || el.textContent.trim();
    el.dataset.original = text;
    el.textContent = '';

    for (const char of text) {
        const span = document.createElement('span');
        span.classList.add('lettre');
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
    }
    /* Le français est la taille de référence — on remet à 1 */
    document.documentElement.style.setProperty('--titre-scale', '1');
}

/* =====================================================
   AJUSTEMENT AUTOMATIQUE DE LA TAILLE DU TITRE
   Réduit --titre-scale jusqu'à ce que le titre tienne
   sur une ligne. En français, scale = 1 toujours.
   ===================================================== */
function ajusterTailreTitre(isFrancais) {
    if (isFrancais) {
        document.documentElement.style.setProperty('--titre-scale', '1');
        return;
    }
    const el = document.getElementById('grand-titre');
    const container = el.parentElement;
    if (!el || !container) return;

    let scale = 1;
    document.documentElement.style.setProperty('--titre-scale', scale);

    /* Réduit par pas de 0.5% jusqu'à tenir dans le container */
    const maxW = container.clientWidth;
    while (el.scrollWidth > maxW && scale > 0.4) {
        scale = Math.round((scale - 0.005) * 1000) / 1000;
        document.documentElement.style.setProperty('--titre-scale', scale);
    }
}

/* =====================================================
   TITRE — COMPATIBILITÉ GOOGLE TRANSLATE
   Observe le changement de lang sur <html> déclenché par GT.
   Relit la traduction depuis un dictionnaire si elle existe,
   sinon garde le texte original. Rejoue l'animation.
   ===================================================== */
(function () {
    const traductions = {
        'en': 'Humanity',
        'es': 'La Humanidad',
        'de': 'Die Menschheit',
        'it': "L'Umanita",
        'pt': 'A Humanidade',
        'ar': 'الإنسانية',
        'zh': '人道报',
        'ja': 'リュマニテ',
        'ru': 'Юманите',
        'nl': 'De Mensheid',
        'pl': 'Ludzkość',
    };

    const el = document.getElementById('grand-titre');
    if (!el) return;

    let derniereLang = 'fr';

    async function mettreAJourTitre(lang) {
        const base = (lang || '').split('-')[0].toLowerCase();
        if (base === derniereLang) return;
        derniereLang = base;

        const original = el.dataset.original || "l'Humanite";
        const nouveauTexte = (base === 'fr') ? original : (traductions[base] || original);

        el.textContent = '';

        for (const char of nouveauTexte) {
            const span = document.createElement('span');
            span.classList.add('lettre');
            span.textContent = char === ' ' ? '\u00A0' : char;
            el.appendChild(span);
        }

        /* Ajuste la taille si le texte est plus long qu'en français */
        const isFrancais = (base === 'fr');
        ajusterTailreTitre(isFrancais);

        const lettres = Array.from(el.querySelectorAll('.lettre'));
        const ordre = lettres
            .map(v => ({ v, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map(o => o.v);

        for (const lettre of ordre) {
            await wait(40 + Math.random() * 100);
            lettre.classList.add('is-printed');
        }
    }

    const langObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mut) {
            if (mut.attributeName === 'lang') {
                mettreAJourTitre(document.documentElement.lang);
            }
        });
    });

    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

function melangerArray(array) {
    return array
        .map(v => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(o => o.v);
}

async function animerTitre() {
    const lettres = Array.from(document.querySelectorAll('#grand-titre .lettre'));
    const ordre = melangerArray(lettres);

    for (let i = 0; i < ordre.length; i++) {
        const lettre = ordre[i];
        const delai = 60 + Math.random() * 140;
        await wait(delai);
        lettre.classList.add('is-printed');
    }
}

/* -- Anime une bordure CSS de transparent vers sa couleur finale -- */
function animateBorder(el, prop, targetColor, duration) {
    return new Promise(resolve => {
        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            if (prop === 'borderTop') {
                el.style.borderTopColor = `rgba(190,190,190,${t})`;
            } else {
                el.style.borderBottomColor = `rgba(202,202,202,${t})`;
            }
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
        }

        requestAnimationFrame(tick);
    });
}

function animateBorderDark(el, duration) {
    return new Promise(resolve => {
        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            el.style.borderTopColor = `rgba(17,17,17,${t})`;
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
        }

        requestAnimationFrame(tick);
    });
}

/* -- Fait apparaître la meta-row -- */
async function animerMetaRow() {
    const metaRow = document.getElementById('meta-row');
    metaRow.style.opacity = '1';
    metaRow.style.borderTopColor = 'transparent';
    metaRow.style.borderBottomColor = 'transparent';

    await wait(100);
    await animateBorder(metaRow, 'borderTop', '#bebebe', 700);
    await wait(200);

    const mg = document.getElementById('meta-gauche');
    const mc = document.getElementById('meta-centre');
    const md = document.getElementById('meta-droite');

    mg.classList.add('is-visible');
    await wait(120);
    mc.classList.add('is-visible');
    await wait(120);
    md.classList.add('is-visible');
    await wait(300);

    await animateBorder(metaRow, 'borderBottom', '#cacaca', 600);
}

/* -- Fait apparaître la grille colonne par colonne -- */
async function animerGrille() {
    const grille = document.getElementById('grille');
    grille.style.opacity = '1';
    grille.style.borderTopColor = 'transparent';

    await animateBorderDark(grille, 800);
    await wait(150);

    for (let i = 0; i <= 4; i++) {
        const col = document.getElementById('col-' + i);
        if (col) {
            col.classList.add('is-visible');
            await wait(180);
        }
    }
}

/* -- Fait apparaître l'article -- */
async function animerArticle() {
    const article = document.getElementById('article-main');
    article.classList.add('is-visible');
}

/* -- Séquence principale -- */
async function lancerSequence() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    prepareTitre();
    updateJournalScale();

    // 1. Apparition du fond papier
    await wait(300);
    const wrap = document.getElementById('main-wrap');
    wrap.classList.add('is-visible');

    // 2. Lever le voile noir
    await wait(800);
    document.getElementById('cinematic-veil').classList.add('lifted');

    // 3. Bloc titre
    await wait(400);
    const titreBloc = document.getElementById('titre-bloc');
    titreBloc.style.opacity = '1';
    titreBloc.style.transition = 'opacity 0.01s';

    // 4. Impression lettre par lettre
    await animerTitre();

    // 5. Meta row
    await wait(350);
    await animerMetaRow();

    // 6. Grille
    await wait(300);
    await animerGrille();

    // 7. Article
    await wait(500);
    await animerArticle();

    // 8. Machine à écrire
    await wait(600);
    lancerTyping();
}

/* =====================================================
   MACHINE À ÉCRIRE — ARTICLE
   ===================================================== */
function lancerTyping() {
    const template = document.getElementById('article-content-template');
    const target   = document.getElementById('article-body');
    if (!template || !target) return;

    const nodes = Array.from(template.content.childNodes);
    const charDelay = 0.3; // ms par caractère

    async function typeNodes(nodeList, container) {
        for (const node of nodeList) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                for (const ch of text) {
                    await wait(charDelay);
                    container.appendChild(document.createTextNode(ch));
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = document.createElement(node.tagName.toLowerCase());
                for (const attr of node.attributes) {
                    el.setAttribute(attr.name, attr.value);
                }
                container.appendChild(el);
                await typeNodes(Array.from(node.childNodes), el);
            }
        }
    }

    typeNodes(nodes, target);
}

/* =====================================================
   UTILITAIRE — COMPATIBILITÉ GOOGLE TRANSLATE
   Remonte le DOM en traversant les <font> que Google Translate
   insère à l'intérieur des éléments. Permet de retrouver le
   .mot-clef ancêtre même quand e.target est un <font> enfant.
   ===================================================== */
function trouverMotClef(el, container) {
    let node = el;
    while (node && node !== container) {
        if (node.classList && node.classList.contains('mot-clef')) return node;
        node = node.parentElement;
    }
    return null;
}

/* =====================================================
   MOTS CLEFS — LÉGENDE EN MARGE
   ===================================================== */
(function () {
    const margeTitre = document.getElementById('marge-titre');
    const articleBody = document.getElementById('article-body');
    if (!margeTitre || !articleBody) return;

    let motActif = null;

function positionnerLegende(mot) {
    const parent = margeTitre.parentElement;

    const parentRect = parent.getBoundingClientRect();
    const rect = mot.getBoundingClientRect();

    const offsetTop = rect.top - parentRect.top;

    const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u'));
    const offsetY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--legende-offset-y'));

    const coeff = offsetTop / u + offsetY;

    margeTitre.style.top = 'calc(' + coeff + ' * var(--u))';
}

    /* Résistance Google Translate — trouverMotClef() est définie globalement */
    articleBody.addEventListener('mouseover', function (e) {
        const mot = trouverMotClef(e.target, articleBody);
        if (!mot) return;

        motActif = mot;

        margeTitre.innerHTML =
            '<span class="legende-categorie">' + (mot.dataset.categorie || '') + '</span>' +
            '<span class="legende-citation">'  + (mot.dataset.titre     || '') + '</span>';

        positionnerLegende(mot);
        margeTitre.classList.add('visible');
    });

    articleBody.addEventListener('mouseout', function (e) {
        const mot = trouverMotClef(e.target, articleBody);
        if (!mot) return;
        if (mot.contains(e.relatedTarget)) return;
        motActif = null;
        margeTitre.classList.remove('visible');
    });

    /*
     * MutationObserver — résistance à Google Translate
     * -------------------------------------------------
     * Google Translate peut déplacer les nœuds enfants d'un .mot-clef
     * dans un <font> intermédiaire, orphelin du .mot-clef original.
     * On surveille le sous-arbre : dès qu'un <font> sans data-key apparaît
     * à l'intérieur d'un .mot-clef, on lui copie les data-* du parent
     * pour que trouverMotClef() puisse remonter jusqu'à lui.
     * On réinjecte aussi data-key sur tout .mot-clef qui l'aurait perdu.
     */
    const gtObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mut) {
            mut.addedNodes.forEach(function (node) {
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                /* Cas 1 : un nouveau <font> apparaît dans un .mot-clef */
                const parentMot = trouverMotClef(node, articleBody);
                if (parentMot && !node.dataset.key) {
                    node.dataset.key       = parentMot.dataset.key       || '';
                    node.dataset.categorie = parentMot.dataset.categorie || '';
                    node.dataset.titre     = parentMot.dataset.titre     || '';
                }

                /* Cas 2 : un nœud contient des .mot-clef descendants à réparer */
                node.querySelectorAll && node.querySelectorAll('.mot-clef').forEach(function (mot) {
                    if (!mot.dataset.key) {
                        /* Essaie de retrouver la clé depuis un éventuel ancêtre font annoté */
                        let anc = mot.parentElement;
                        while (anc && anc !== articleBody) {
                            if (anc.dataset && anc.dataset.key) {
                                mot.dataset.key       = anc.dataset.key;
                                mot.dataset.categorie = anc.dataset.categorie || mot.dataset.categorie;
                                mot.dataset.titre     = anc.dataset.titre     || mot.dataset.titre;
                                break;
                            }
                            anc = anc.parentElement;
                        }
                    }
                });
            });
        });
    });

    gtObserver.observe(articleBody, { childList: true, subtree: true });

    // Au resize, --u change → calc() se recalcule seul.
    // On recalcule le coeff quand même car offsetTop en px change avec le layout.
    window.addEventListener('resize', function () {
        if (!motActif || !margeTitre.classList.contains('visible')) return;
        requestAnimationFrame(function () {
            positionnerLegende(motActif);
        });
    });
})();

/* =====================================================
   MOTS CLEFS — OUVERTURE MÉDIA EN RIDEAU
   ===================================================== */
(function () {
    const articleColumn  = document.getElementById('article-column');
    const articleBody    = document.getElementById('article-body');
    const wrap           = document.getElementById('main-wrap');
    const curtains       = Array.from(document.querySelectorAll('.curtain'));
    const videoLayer     = document.getElementById('article-video-layer');
    const video          = document.getElementById('article-video');
    const closeBtn       = document.getElementById('video-close');
    const margeTitre     = document.getElementById('marge-titre');

    const audio          = document.getElementById('article-audio');
    const audioToggle    = document.getElementById('audio-toggle');
    const audioBar       = document.getElementById('audio-bar');
    const audioProgress  = document.querySelector('.audio-progress');
    const videoPanel     = document.getElementById('media-panel-video');
    const audioPanel     = document.getElementById('media-panel-audio');

    if (!articleColumn || !articleBody || !wrap || !videoLayer || !video || !closeBtn || curtains.length === 0) return;

    /* ---- Correspondances mots → fichiers média ---- */
    const mediaMap = {
        'condamne': {
            type: 'video',
            src: 'Démesure.mp4',
            legende: {
                nom:       'Ambre & Flavien',
                role:      'Lycéens',
                projet:    'Les Restes Humains Patrimonialisés, héritage, éthique et politique',
                soustitre: 'Dénouer les images manquantes de Soliman Al-Halabi',
                citation:  '« Le Syrien fanatique »',
                copyright: 'CNRS — Abounaddara 2025–2026'
            }
        },
        'souffrance': {
            type: 'audio',
            src: 'temoignage-guillaume.wav',
            title: 'Témoignage Guillaume — « Horrible souffrance »'
        },
        'bourreau': {
            type: 'video',
            src: "L'âme-noire.mp4",
            legende: {
                nom:       'Mathieu',
                role:      'Lycéen',
                projet:    'Les Restes Humains Patrimonialisés, héritage, éthique et politique',
                soustitre: 'Dénouer les images manquantes de Soliman Al-Halabi',
                citation:  '« Le Syrien fanatique »',
                copyright: 'CNRS — Abounaddara 2025–2026'
            }
        },
        'supplice': {
            type: 'video',
            src: 'Au-tribunal.mp4',
            legende: {
                nom:       'Ambre & Garance',
                role:      'Lycéennes',
                projet:    'Les Restes Humains Patrimonialisés, héritage, éthique et politique',
                soustitre: 'Dénouer les images manquantes de Soliman Al-Halabi',
                citation:  '« Le Syrien fanatique »',
                copyright: 'CNRS — Abounaddara 2025–2026'
            }
        }
    };

    let isAnimating = false;
    let isVideoOpen = false;
    let lastFocusedTrigger = null;
    let isScrubbingAudio = false;

    /* ---- Helpers barre audio ---- */
    function updateAudioBar() {
        if (!audio.duration) return;
        audioBar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }

    function setAudioTimeFromClientX(clientX) {
        if (!audio.duration || !audioProgress) return;
        const rect  = audioProgress.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audio.currentTime = ratio * audio.duration;
        audioBar.style.width = (ratio * 100) + '%';
    }

    /* ---- Synchronisation du fond papier sur les rideaux ---- */
    function syncPaperBackground() {
        const wrapRect  = wrap.getBoundingClientRect();
        const wrapStyle = getComputedStyle(wrap);

        curtains.forEach(curtain => {
            const curtainRect = curtain.getBoundingClientRect();
            const offsetLeft  = curtainRect.left - wrapRect.left;
            const offsetTop   = curtainRect.top  - wrapRect.top;

            curtain.style.setProperty('--paper-bg-image',    wrapStyle.backgroundImage);
            curtain.style.setProperty('--paper-bg-repeat',   wrapStyle.backgroundRepeat);
            curtain.style.setProperty('--paper-bg-size',     wrapStyle.backgroundSize);
            curtain.style.setProperty('--paper-bg-position', wrapStyle.backgroundPosition);
            curtain.style.setProperty('--paper-box-width',   `${wrapRect.width}px`);
            curtain.style.setProperty('--paper-box-height',  `${wrapRect.height}px`);
            curtain.style.setProperty('--paper-offset-left', `${-offsetLeft}px`);
            curtain.style.setProperty('--paper-offset-top',  `${-offsetTop}px`);
        });
    }

    window.addEventListener('load',   syncPaperBackground);
    window.addEventListener('resize', syncPaperBackground);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncPaperBackground);
    }

function repositionLegend() {
    if (!isVideoOpen || !margeTitre || !curtainLineLeft) return;

    const lineRect = curtainLineLeft.getBoundingClientRect();
    const colRect  = articleColumn.getBoundingClientRect();
    const lineLeftInCol = lineRect.left - colRect.left;

    const styles       = getComputedStyle(document.documentElement);
    const u            = parseFloat(styles.getPropertyValue('--u'));
    const legendeLeft  = parseFloat(styles.getPropertyValue('--legende-left'))  * u;
    const legendeWidth = parseFloat(styles.getPropertyValue('--legende-width')) * u;
    const initialGap   = -(legendeLeft + legendeWidth);

    margeTitre.style.left = (lineLeftInCol - initialGap - legendeWidth) + 'px';

  
}

    window.addEventListener('resize', repositionLegend);
    window.addEventListener('resize', repositionRightLegend);

    /* ---- Lecture des données média depuis un mot-clef ---- */
    function getMediaData(mot) {
        const key = (mot.dataset.key || mot.textContent || '').trim().toLowerCase();
        return mediaMap[key] || null;
    }

    /* ---- Rideau ---- */
   const curtainLineLeft  = document.querySelector('.curtain-line--left');
const curtainLineRight = document.querySelector('.curtain-line--right');
const margeDroite      = document.getElementById('marge-droite');
    let rafId       = null;
    let isTracking  = false;
    let trackingEntry = true;

function trackLegend() {
    if (!margeTitre || !curtainLineLeft) return;

    const lineRect = curtainLineLeft.getBoundingClientRect();
    const colRect  = articleColumn.getBoundingClientRect();
    const lineLeftInCol = lineRect.left - colRect.left;

    const styles       = getComputedStyle(document.documentElement);
    const u            = parseFloat(styles.getPropertyValue('--u'));
    const legendeLeft  = parseFloat(styles.getPropertyValue('--legende-left'))  * u;
    const legendeWidth = parseFloat(styles.getPropertyValue('--legende-width')) * u;
    const initialGap   = -(legendeLeft + legendeWidth);

    margeTitre.style.left = (lineLeftInCol - initialGap - legendeWidth) + 'px';

    if (trackingEntry === true) {
        // Ouverture vers média : légende gauche suit la ligne
        if (lineRect.right > colRect.left) {
            margeTitre.classList.add('visible');
        } else {
            margeTitre.classList.remove('visible');
        }
    } else if (trackingEntry === false) {
        // Ouverture depuis média : légende gauche reste visible
        margeTitre.classList.add('visible');
    }
    // trackingEntry === null : retour au texte après fermeture — ne pas toucher aux légendes

    // Ne repositionne la droite que si elle est visuellement présente
    if (margeDroite && (margeDroite.classList.contains('line-visible') || margeDroite.classList.contains('animating'))) {
        trackRightLegend();
    }

    if (isTracking) rafId = requestAnimationFrame(trackLegend);
}
    // Référence au stage pour le positionnement au repos
    const articleStage = document.getElementById('article-stage');

    /* Positionne marge-droite depuis la curtain-line (pendant l'animation) */
    function trackRightLegend() {
        if (!margeDroite || !curtainLineRight || !articleColumn) return;

        const lineRect       = curtainLineRight.getBoundingClientRect();
        const colRect        = articleColumn.getBoundingClientRect();
        const lineRightInCol = lineRect.right - colRect.left;

        const u   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u'));
        const gap = 14 * u;

        margeDroite.style.left = (lineRightInCol + gap) + 'px';
    }

    /* Positionne marge-droite depuis le bord droit du stage (au repos, média ouvert) */
    function repositionRightLegend() {
        if (!margeDroite || !articleStage || !articleColumn) return;
        if (!isVideoOpen) return;

        const stageRect = articleStage.getBoundingClientRect();
        const colRect   = articleColumn.getBoundingClientRect();
        const stageRightInCol = stageRect.right - colRect.left;

        const u   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u'));
        const gap = 14 * u;

        margeDroite.style.left = (stageRightInCol + gap) + 'px';
    }

    function startTracking(entry) {
        if (isTracking) return;
        trackingEntry = entry; // true | false | null
        isTracking = true;
        rafId = requestAnimationFrame(trackLegend);
    }

    function stopTracking() {
        isTracking = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    async function fermerRideau() {
        articleColumn.classList.add('is-transitioning', 'is-curtains-closed');
        await wait(560);
    }

    async function ouvrirRideau() {
        articleColumn.classList.remove('is-curtains-closed');
        await wait(560);
        articleColumn.classList.remove('is-transitioning');
    }

    /* ---- Ouvrir un média ---- */
    async function ouvrirMedia(media, trigger) {
        if (isAnimating || isVideoOpen) return;

        isAnimating = true;
        lastFocusedTrigger = trigger || null;
        syncPaperBackground();

        // Prépare la légende droite — reset complet puis injection du texte
        if (margeDroite) {
            margeDroite.classList.remove('visible', 'hiding', 'hidden', 'line-visible', 'animating');
            if (media.legende) {
                const l = media.legende;
                margeDroite.innerHTML =
                    `<span class="legende-droite-nom">${l.nom}</span>` +
                    `<span class="legende-droite-corps">${l.role}</span>` +
                    `<span class="legende-droite-filet"></span>` +
                    `<span class="legende-droite-projet">${l.projet}</span>` +
                    `<span class="legende-droite-corps">${l.soustitre}</span>` +
                    `<span class="legende-droite-citation">${l.citation}</span>` +
                    `<span class="legende-droite-copyright">${l.copyright}</span>`;
            } else {
                margeDroite.innerHTML = '';
            }
            trackRightLegend();
        }

        // Reset légende gauche aussi
        if (margeTitre) {
            margeTitre.classList.remove('hiding');
        }

        startTracking(true);

        // Le rideau met 560ms à se fermer (transition CSS).
        // On attend la moitié (~280ms) = moment où les lignes se rejoignent au centre.
        // Puis on marque un arrêt et on fait apparaître la légende droite.
        const CURTAIN_HALF = 280;
        const PAUSE = 350;

        // Lance la fermeture du rideau
        articleColumn.classList.add('is-transitioning', 'is-curtains-closed');

        // Attend que les lignes se touchent au centre
        await wait(CURTAIN_HALF);

        // 1. Le trait gauche se trace
        if (margeDroite && media.legende) {
            margeDroite.classList.add('line-visible');
        }

        // 2. Court battement — le trait s'installe
        await wait(160);

        // 3. Les éléments glissent en cascade depuis la droite
        if (margeDroite && media.legende) {
            margeDroite.classList.add('animating');
        }

        // 4. Temps d'arrêt dramatique pour lire la légende
        await wait(PAUSE);

        // 5. Laisse la transition CSS se finir
        await wait(CURTAIN_HALF);

        stopTracking();

        articleColumn.classList.add('is-video-open');
        videoLayer.setAttribute('aria-hidden', 'false');

        videoPanel.style.display = 'none';
        audioPanel.style.display = 'none';

        if (media.type === 'video') {
            videoPanel.style.display = 'flex';
            video.src = media.src;
            video.currentTime = 0;
            video.play().catch(() => {});
        }

        if (media.type === 'audio') {
            audioPanel.style.display = 'flex';
            audio.src = media.src;
            audio.currentTime = 0;
            audio.play().catch(() => {});
            audioToggle.textContent = 'Pause';
        }

        await wait(40);

        startTracking(false);
        await ouvrirRideau();
        stopTracking();

        // Rideau ouvert — on bascule sur le positionnement stable depuis le stage
        repositionRightLegend();

        articleColumn.classList.add('is-video-ui-visible');
        isVideoOpen = true;
        isAnimating = false;
    }

    /* ---- Fermer le média — séquence cinématographique ---- */
    async function fermerVideo() {
        if (isAnimating || !isVideoOpen) return;
        isAnimating = true;

        articleColumn.classList.remove('is-video-ui-visible');

        // 1. Légende gauche — fade out
        if (margeTitre) {
            margeTitre.classList.remove('visible');
            margeTitre.classList.add('hiding');
        }

        // 1b. Légende droite — éléments repartent vers la droite en cascade
        if (margeDroite) {
            margeDroite.classList.remove('animating');
            margeDroite.classList.add('hiding');
        }

        // 2. Attendre la fin de la cascade sortante (7 éléments × ~18ms + durée 150ms ≈ 320ms)
        await wait(320);
        if (margeDroite) {
            margeDroite.classList.remove('hiding', 'line-visible');
            margeDroite.classList.add('hidden');
        }

        // 3. Le rideau commence à se fermer (synchrone avec la fin du trait)
        await wait(100);
        startTracking(true);
        articleColumn.classList.add('is-transitioning', 'is-curtains-closed');
        await wait(560);
        stopTracking();

        // 4. Nettoyage complet des légendes — reset total
        if (margeTitre) {
            margeTitre.classList.remove('hiding', 'visible');
            margeTitre.style.left = '';
        }
        if (margeDroite) {
            margeDroite.classList.remove('hidden', 'hiding', 'visible', 'line-visible', 'animating');
            margeDroite.style.left = '';
            margeDroite.innerHTML = '';
        }

        // 5. Stop média
        video.pause();
        video.removeAttribute('src');
        video.load();

        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audioBar.style.width = '0%';
        audioToggle.textContent = 'Lecture';

        const subtitles = document.getElementById('audio-subtitles');
        subtitles.classList.remove('is-visible');
        subtitles.textContent = '';

        articleColumn.classList.remove('is-video-open');
        videoLayer.setAttribute('aria-hidden', 'true');
        await wait(40);

        // 6. Rideau s'ouvre — retour au texte (null = ne pas toucher aux légendes)
        startTracking(null);
        await ouvrirRideau();
        stopTracking();

        isVideoOpen = false;
        isAnimating = false;

        if (lastFocusedTrigger) {
            lastFocusedTrigger.focus({ preventScroll: true });
        }
    }

    /* ---- Événements audio ---- */
    audioToggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            audioToggle.textContent = 'Pause';
        } else {
            audio.pause();
            audioToggle.textContent = 'Lecture';
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!isScrubbingAudio) updateAudioBar();
    });

    audio.addEventListener('play', () => {
        const textTrack = audio.textTracks[0];
        if (!textTrack) return;
        textTrack.mode = 'showing';

        const subtitles = document.getElementById('audio-subtitles');

        textTrack.oncuechange = () => {
            const cue = textTrack.activeCues[0];
            if (cue && cue.text) {
                subtitles.textContent = cue.text;
                requestAnimationFrame(() => {
                    subtitles.classList.add('is-visible');
                });
            } else {
                subtitles.classList.remove('is-visible');
                setTimeout(() => {
                    if (!textTrack.activeCues.length) {
                        subtitles.textContent = '';
                    }
                }, 220);
            }
        };
    });

    if (audioProgress) {
        audioProgress.addEventListener('pointerdown', (e) => {
            if (!audio.duration) return;
            isScrubbingAudio = true;
            setAudioTimeFromClientX(e.clientX);
            try { audioProgress.setPointerCapture(e.pointerId); } catch (_) {}
        });

        audioProgress.addEventListener('pointermove', (e) => {
            if (!isScrubbingAudio) return;
            setAudioTimeFromClientX(e.clientX);
        });

        const stopScrubbing = (e) => {
            if (!isScrubbingAudio) return;
            isScrubbingAudio = false;
            try { audioProgress.releasePointerCapture(e.pointerId); } catch (_) {}
        };

        audioProgress.addEventListener('pointerup',     stopScrubbing);
        audioProgress.addEventListener('pointercancel', stopScrubbing);

        audioProgress.addEventListener('click', (e) => {
            if (!audio.duration) return;
            const rect  = audioProgress.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = ratio * audio.duration;
            audioBar.style.width = (ratio * 100) + '%';
        });
    }

    /* ---- Fin automatique → fermeture du rideau ---- */
    video.addEventListener('ended', () => {
        if (isVideoOpen) fermerVideo();
    });

    audio.addEventListener('ended', () => {
        if (isVideoOpen) fermerVideo();
    });

    /* ---- Clic sur un mot-clef ---- */
    articleBody.addEventListener('click', function (e) {
        const mot = trouverMotClef(e.target, articleBody);
        if (!mot) return;
        const media = getMediaData(mot);
        if (!media) return;
        e.preventDefault();
        ouvrirMedia(media, mot);
    });

    /* ---- Bouton fermer & Echap ---- */
    closeBtn.addEventListener('click', fermerVideo);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isVideoOpen) {
            e.preventDefault();
            fermerVideo();
        }
    });
})();

/* =====================================================
   DÉMARRAGE
   ===================================================== */
window.addEventListener('load', () => {
    updateJournalScale();
    lancerSequence();
});
