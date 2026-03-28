// ==UserScript==
// @name         Seipai Stream Bypass Ad-Gate Livewire
// @namespace    bypass-adgate
// @version      1.2
// @description  Bypass le mur publicitaire Livewire sans pub
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    var MAX_STEPS = 20;
    var INTERVAL_MS = 300;

    function findComponent() {
        var btn = document.querySelector('[wire\\:click="incrementSteps"]');
        if (!btn) return null;

        var el = btn;
        while (el) {
            var wireId = el.getAttribute && el.getAttribute('wire:id');
            if (wireId && window.Livewire) {
                return window.Livewire.find(wireId);
            }
            el = el.parentElement;
        }

        if (window.Livewire && window.Livewire.all) {
            var all = window.Livewire.all();
            return all.length ? all[0] : null;
        }

        return null;
    }

    function bypass(component) {
        var count = 0;
        var timer = setInterval(function() {
            var btn = document.querySelector('[wire\\:click="incrementSteps"]');
            if (!btn || count >= MAX_STEPS) {
                clearInterval(timer);
                console.log('[Bypass] Termine apres ' + count + ' steps');
                return;
            }
            component.call('incrementSteps');
            count++;
            console.log('[Bypass] Step ' + count);
        }, INTERVAL_MS);
    }

    function hookButton(btn) {
        // Bloque la navigation vers la pub
        btn.removeAttribute('href');
        btn.removeAttribute('target');

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            var component = findComponent();
            if (component) {
                console.log('[Bypass] Clic intercepte, bypass en cours...');
                bypass(component);
            } else {
                console.warn('[Bypass] Composant introuvable');
            }
        }, true);

        console.log('[Bypass] Bouton hooké');
    }

    function waitForButton() {
        var observer = new MutationObserver(function() {
            var btn = document.querySelector('[wire\\:click="incrementSteps"]');
            if (btn && !btn.dataset.hooked) {
                btn.dataset.hooked = 'true';
                observer.disconnect();
                hookButton(btn);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        var btn = document.querySelector('[wire\\:click="incrementSteps"]');
        if (btn && !btn.dataset.hooked) {
            btn.dataset.hooked = 'true';
            hookButton(btn);
        }
    }

    waitForButton();

})();
