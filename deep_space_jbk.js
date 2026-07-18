// ==UserScript==
// @name         Deep Space Client
// @namespace    http://tampermonkey.net/
// @version      Reformed
// @description  Deep Space Client for bloxd.io
// @author       GEORGECR (edited by JBKFire)
// @match        https://bloxd.io/*
// @match        https://*.bloxd.io/*
// @match        https://unbloxd.com/*
// @match        https://bedwarsonline.net/*
// @icon         https://i.postimg.cc/NMG91FWH/space-BG-loco.jpg
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    let crosshairvalue = GM_getValue("crosshair", "https://piskel-imgstore-b.appspot.com/img/7be1c5f3-9ad1-11ef-b170-45e28d82b1ad.gif");
    let capesvalue = GM_getValue("capes", "none");
    let CrossSize = GM_getValue("crosshairSize", 19);
    let colorPicker1Value = GM_getValue("colorPicker1", "#000000");
    let colorPicker2Value = GM_getValue("colorPicker2", "#FFFFFF");
    const customCapes = [
        { id: 'none', name: 'None', texture: null },
        { id: 'vortex_red', name: 'Vortex Red', texture: 'https://raw.githubusercontent.com/GEORGECR0/Vortex-Client/refs/heads/main/assets/vortex/Vortex_Default_Cape_Red.png'},
        { id: 'vortex_yellow', name: 'Vortex Yellow', texture: 'https://raw.githubusercontent.com/JBKFire/cape-textures-bloxd/main/vortex_yellow.png?raw=true'},
        { id: 'vortex_blue', name: 'Vortex Blue', texture: 'https://raw.githubusercontent.com/JBKFire/cape-textures-bloxd/main/vortex_blue.png?raw=true'},
        { id: 'vortex_purple', name: 'Vortex Purple', texture: 'https://raw.githubusercontent.com/JBKFire/cape-textures-bloxd/main/vortex_purple.png?raw=true'},
        { id: 'super', name: 'Super Cape', texture: 'https://raw.githubusercontent.com/JBKFire/cape-textures-bloxd/main/SuperCape.png'},
        { id: 'moon_trail', name: 'Moon Trail', texture: 'https://i.postimg.cc/0Q9rBpks/vortex-moon-trail-cape.png'},
    ];

    const codeDisplayNames = {
        // letters
        'KeyA': ['A', 'A'], 'KeyB': ['B', 'B'], 'KeyC': ['C', 'C'], 'KeyD': ['D', 'D'],
        'KeyE': ['E', 'E'], 'KeyF': ['F', 'F'], 'KeyG': ['G', 'G'], 'KeyH': ['H', 'H'],
        'KeyI': ['I', 'I'], 'KeyJ': ['J', 'J'], 'KeyK': ['K', 'K'], 'KeyL': ['L', 'L'],
        'KeyM': ['M', 'M'], 'KeyN': ['N', 'N'], 'KeyO': ['O', 'O'], 'KeyP': ['P', 'P'],
        'KeyQ': ['Q', 'Q'], 'KeyR': ['R', 'R'], 'KeyS': ['S', 'S'], 'KeyT': ['T', 'T'],
        'KeyU': ['U', 'U'], 'KeyV': ['V', 'V'], 'KeyW': ['W', 'W'], 'KeyX': ['X', 'X'],
        'KeyY': ['Y', 'Y'], 'KeyZ': ['Z', 'Z'],
        'Digit0': ['0', '0'], 'Digit1': ['1', '1'], 'Digit2': ['2', '2'], 'Digit3': ['3', '3'],
        'Digit4': ['4', '4'], 'Digit5': ['5', '5'], 'Digit6': ['6', '6'], 'Digit7': ['7', '7'],
        'Digit8': ['8', '8'], 'Digit9': ['9', '9'],
        'Space': ['SPACE', 'Space'],
        'ShiftLeft': ['LSHIFT', 'Left Shift'],
        'ShiftRight': ['RSHIFT', 'Right Shift'],
        'ControlLeft': ['LCTRL', 'Left Ctrl'],
        'ControlRight': ['RCTRL', 'Right Ctrl'],
        'AltLeft': ['LALT', 'Left Alt'],
        'AltRight': ['RALT', 'Right Alt'],
        'Tab': ['TAB', 'Tab'],
        'CapsLock': ['CAPS', 'Caps Lock'],
        'Enter': ['ENTER', 'Enter'],
        'Escape': ['ESC', 'Escape'],
        'Mouse1': ['LMB', 'Left Click'],
        'Mouse2': ['MMB', 'Middle Click'],
        'Mouse3': ['RMB', 'Right Click']
    };

    function getCodeDisplayName(code, useLongName=false) {
        const entry = codeDisplayNames[code];
        if (!entry) return code;
        return useLongName ? entry[1] : entry[0];
    }

    let appliedCapeId = null;
    let noaInstance = null;

    function findNoa() {
        const deepFindSafe = (obj, test, seen = new Set()) => {
            if (!obj || typeof obj !== 'object' || seen.has(obj)) return null;
            seen.add(obj);
            try {
                if (test(obj)) return obj;
                for (const val of Object.values(obj)) {
                    const res = deepFindSafe(val, test, seen);
                    if (res) return res;
                }
            } catch (e) {}
            return null;
        };
        if (noaInstance) return noaInstance;
        const element = document.querySelector('div.InventoryWrapper') || document.querySelector('.HotBarContainer');
        if (!element) return null;
        const fiberKey = Object.keys(element).find(k => k.startsWith('__reactFiber$'));
        if (!fiberKey) return null;
        const fiber = element[fiberKey];
        const test = (obj) => obj && obj.entities && typeof obj.entities.getState === 'function' && obj.camera;
        noaInstance = deepFindSafe(fiber.memoizedProps, test) || deepFindSafe(fiber.memoizedState, test);
        return noaInstance;
    }

    function modifyCape() {
        try {
            const noa = findNoa();
            if (!noa) return;
            if (appliedCapeId === capesvalue) return;

            const capeState = noa.entities.getState(1, "cape");
            const selected = customCapes.find(c => c.id === capesvalue);

            if (!selected || !selected.texture) {
                capeState.chooseCape('none');
                appliedCapeId = capesvalue;
                return;
            }

            capeState.chooseCape('super');
            const material = capeState.mesh && capeState.mesh.material;
            if (!material || !material.diffuseTexture) return;

            material.diffuseTexture.updateURL(selected.texture);
            material.diffuseTexture.hasAlpha = true;
            material.disableLighting = false;
            if (typeof material.markAsDirty === 'function') material.markAsDirty();

            appliedCapeId = capesvalue;
        } catch (error) {}
    }
    let ApplyCape = true;
    function checkState() {
        const Ingame = document.querySelector(".InGameHeader");
        if (Ingame && window.getComputedStyle(Ingame).display !== "none") {
            if (ApplyCape) {
                modifyCape();
                if (appliedCapeId === capesvalue) {
                    ApplyCape = false;
                }
            }
        } else {
            ApplyCape = true;
        }
    }
    checkState();
    setInterval(checkState, 3000);

    function fast_refresh() {
        document.title = "Bloxd.io - Deep Space Client";
        const maintext = document.querySelector('.Title.FullyFancyText');
        if (maintext) {
            maintext.style.webkitTextStroke = "0px";
            maintext.textContent = "Deep Space";
            maintext.style.textShadow = "10px 5px 5px #000000";
            maintext.style.fontSize = "60px";
        }

        const crosshair = document.querySelector(".CrossHair");
        if (crosshair) {
            crosshair.textContent = "";
            crosshair.style.backgroundImage = `url(${crosshairvalue})`;
            crosshair.style.backgroundRepeat = "no-repeat";
            crosshair.style.backgroundSize = "contain";
            crosshair.style.width = CrossSize + "px";
            crosshair.style.height = CrossSize + "px";
        }

        document.querySelectorAll(".HotBarItem").forEach(hotbar => {
            hotbar.style.borderRadius = "12px";
            hotbar.style.borderColor = colorPicker1Value;
            hotbar.style.backgroundColor = "transparent";
            hotbar.style.boxShadow = "none";
            hotbar.style.outline = "transparent";
        });

        document.querySelectorAll(".SelectedItem").forEach(slot => {
            slot.style.backgroundColor = "transparent";
            slot.style.boxShadow = "none";
            slot.style.borderRadius = "15px";
            slot.style.borderColor = colorPicker2Value;
            slot.style.outline = "transparent";
        });

        document.querySelectorAll('.LoadingOverlayRight').forEach(EnterDiv => {
            EnterDiv.style.transform = 'translate(-20% , 25%)';
        });

        document.querySelectorAll('.TitleContainer').forEach(TOP => {
            TOP.style.height = '70px';
            TOP.style.width = '50%';
        });
        document.querySelectorAll('.HomeHeaderRight').forEach(optionsTR => {
            optionsTR.style.backgroundColor = "rgba(136, 50, 64,0.45)";
        });

        document.querySelectorAll('.CreativeItemSlotsSearch').forEach(searchbar => {
            searchbar.style.color = 'white';
            searchbar.style.textShadow = "none";
            searchbar.style.backgroundColor = 'transparent';
            searchbar.style.border = "2px solid black";
            searchbar.style.boxShadow = "none";
            searchbar.style.borderRadius = "0px";
        });

    }

    // Run once immediately, then only re-run when the game actually re-renders
    // (adds/removes DOM nodes) instead of blindly polling every tick.
    fast_refresh();
    let fastRefreshScheduled = false;
    const fastRefreshObserver = new MutationObserver(() => {
        if (fastRefreshScheduled) return; // multiple mutations in one frame collapse into one pass
        fastRefreshScheduled = true;
        requestAnimationFrame(() => {
            fast_refresh();
            fastRefreshScheduled = false;
        });
    });
    fastRefreshObserver.observe(document.body, { childList: true, subtree: true });

    const UI_aesthetics = () => {

        ['LogoContainer', 'cube' , 'HomeScreenBottomLeft'].forEach(className => {
            document.querySelectorAll('.' + className).forEach(el => el.remove());
        });

        ['GameAdsBanner', 'HomeBannerInner' , 'ShopBannerDiv' , 'SettingsAdOuter' , 'InventoryAdInner' , 'RespawnLeaderboardBannerDivInner' , 'RespawnSideSquareBannerDiv' , 'LoadingOverlayLeft ' , 'LoadingOverlayRightAdBannerContainer' , 'LoadingOverlayDividerContainer '].forEach(className => {
            document.querySelectorAll('.' + className).forEach(ads => {
                ads.style.opacity = '0';
                ads.style.transform = 'translateX(100%)';
                ads.style.height = '2px';
                ads.style.widght = '2px';
            });
        });

        document.querySelectorAll('.PlayerNamePreview').forEach(optionsTL => {
            optionsTL.style.backgroundColor = "rgba(136, 50, 64 ,0.45)";
            optionsTL.style.color = "white";
            optionsTL.style.textShadow = "none";
        });

        document.querySelectorAll('.SocialBarInner').forEach(socialbox => {
            socialbox.style.backgroundColor = "rgba(0,0,0,1)";
            socialbox.style.opacity = '1';
        });

        document.querySelectorAll('.InvenItem[data-inven-idx="46"], .InvenItem[data-inven-idx="47"], .InvenItem[data-inven-idx="48"], .InvenItem[data-inven-idx="49"], .InvenItem[data-inven-idx="50"]').forEach(ARMOR => {
            ARMOR.style.backgroundColor = "transparent";
            ARMOR.style.boxShadow = "none";
            ARMOR.style.borderColor = "transparent";
            ARMOR.style.outline = "transparent";
        });
        document.querySelectorAll('.InvenItem[data-inven-idx="46"] .InvenItemUnfilled').forEach(armor => {
            armor.style.backgroundImage = 'url(https://piskel-imgstore-b.appspot.com/img/f7c20a66-3491-11ef-911f-9f3fc6109f85.gif)';
        });
        document.querySelectorAll('.InvenItem[data-inven-idx="47"] .InvenItemUnfilled').forEach(armor => {
            armor.style.backgroundImage = 'url(https://piskel-imgstore-b.appspot.com/img/bb5b78a8-3498-11ef-bcaf-9f3fc6109f85.gif)';
        });
        document.querySelectorAll('.InvenItem[data-inven-idx="48"] .InvenItemUnfilled').forEach(armor => {
            armor.style.backgroundImage = 'url(https://piskel-imgstore-b.appspot.com/img/ab8a4be8-3491-11ef-8f57-9f3fc6109f85.gif)';
        });
        document.querySelectorAll('.InvenItem[data-inven-idx="49"] .InvenItemUnfilled').forEach(armor => {
            armor.style.backgroundImage = 'url(https://piskel-imgstore-b.appspot.com/img/f1d6cc85-3493-11ef-a098-9f3fc6109f85.gif)';
        });
        document.querySelectorAll('.InvenItem[data-inven-idx="50"] .InvenItemUnfilled').forEach(armor => {
            armor.style.backgroundImage = 'url(https://piskel-imgstore-b.appspot.com/img/e3868a0c-d01f-11ef-b884-578249ac6cf7.gif)';
        });

        document.querySelectorAll('.AvailableGame').forEach(item => {
            item.style.border = "none";
            item.style.borderRadius = "0px";
            item.style.boxShadow = "0px 10px 20px rgba(0, 0, 0, 0.4)";
        });

        document.querySelectorAll('.AvailableGameTextInner').forEach(name => {
            name.style.textShadow = "none";
        });
        document.querySelectorAll('.AvailableGameTextWrapperBackground').forEach(removebox => {
            removebox.style.opacity= "0";
        });

    };

    document.addEventListener('DOMContentLoaded', UI_aesthetics);
    setInterval(UI_aesthetics, 2000);
    const Mods = [
        { id: 1, name: 'ARMOR VIEW', backgroundImage: 'url(https://i.postimg.cc/rpyVVM4G/Armor-View.png)' },
        { id: 2, name: 'TOGGLE SPRINT', backgroundImage: 'url(https://i.postimg.cc/xd9GyxJj/Toggle-Sprint.png)' },
        { id: 3, name: 'CROSSHAIR', backgroundImage: 'url(https://i.postimg.cc/FRy45KFV/Crosshairs.png)' },
        { id: 4, name: 'HANDITEM VIEW', backgroundImage: 'url(https://i.postimg.cc/9fy0xC9y/Hand-Item-View.png)' },
        { id: 5, name: 'CPS COUNTER', backgroundImage: 'url(https://i.postimg.cc/X7W8xYyk/Cps-Counter.png)' },
        { id: 6, name: 'PING COUNTER', backgroundImage: 'url(https://i.postimg.cc/HnrV959k/Ping-Counter.png)' },
        { id: 7, name: 'CINEMATIC MODE', backgroundImage: 'url(https://i.postimg.cc/g228xwfr/Cinematic-Mode.png)' },
        { id: 8, name: 'KEYSTROKES', backgroundImage: 'url(https://i.postimg.cc/Fsh6zZGv/Keystrokes.png)' },
        { id: 9, name: 'HOTBAR', backgroundImage: 'url(https://i.postimg.cc/c4VdPP0h/Hotbar.png)' },
        { id: 10, name: 'RESOLUTION', backgroundImage: 'url(https://i.postimg.cc/cJ11cwsG/Resolution-Adjuster.png)' },
        { id: 11, name: 'OG MENU', backgroundImage: 'url(https://i.postimg.cc/c4VdPP0h/Hotbar.png)' }
    ];

    const createhud = (id, zIndex) => {
        const hud = document.createElement('div');
        hud.id = id;
        hud.style.position = 'fixed';
        hud.style.left = '0px';
        hud.style.top = '0px';
        hud.style.backgroundColor = 'transparent';
        hud.style.width = '100%';
        hud.style.height = '100%';
        hud.style.display = 'block';
        hud.style.zIndex = zIndex;

        hud.style.pointerEvents = 'none';

        hud.addEventListener('mouseover', (event) => {
            if (event.target !== hud) {
                event.target.style.pointerEvents = 'auto';
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        node.style.pointerEvents = 'auto';
                    }
                });
            });
        });

        observer.observe(hud, { childList: true, subtree: true });

        document.body.appendChild(hud);
        return hud;
    };
    const mainHud = createhud('toggleHud', '500');
    const createBox = (id, zIndex) => {
        const box = document.createElement('div');
        box.id = id;
        box.style.position = 'absolute';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        box.style.width = '820px';
        box.style.height = '600px';
        box.style.backgroundColor = 'rgb(40, 40, 40)';
        box.style.color = 'white';
        box.style.borderRadius = '20px';
        box.style.display = 'none';
        box.style.padding = '20px';
        box.style.overflowY = 'auto';
        box.style.zIndex = zIndex;

        mainHud.appendChild(box);

        return box;
    };
    const createmenu = (id, zIndex) => {
        const menu = document.createElement('div');
        menu.id = id;
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.width = '500px';
        menu.style.height = '295px';
        menu.style.color = 'white';
        menu.style.display = 'none';
        menu.style.justifyContent = 'flex-end';
        menu.style.flexDirection = 'column';
        menu.style.padding = '20px';
        menu.style.alignItems = 'center';
        menu.style.backgroundImage = 'url(https://i.postimg.cc/K8kJ6jnq/DSLOLGO.png)';
        menu.style.backgroundRepeat = "no-repeat";
        menu.style.backgroundSize = "400px 230px";
        menu.style.backgroundPosition = 'center calc(50% - 20px)';
        menu.style.zIndex = zIndex;
        mainHud.appendChild(menu);
        return menu;
    };
    const mainMenu = createmenu('toggleMenu', '1000');

    const mainBox = createBox('toggleBox', '1001');

    const settingsModal = createBox('settingsModal', '1002');
    settingsModal.style.backgroundColor = 'rgb(40, 40, 40)';

    const crosshairSettingsModal = createBox('crosshairSettingsModal', '1002');
    crosshairSettingsModal.style.backgroundColor = 'rgb(40, 40, 40)';

    const capeModal = createBox('hotbarSettingsModal', '1002');
    capeModal.style.backgroundColor = 'transparent';
    capeModal.style.justifyContent = 'center';
    capeModal.style.alignItems = 'center';

    const hotbarSettingsModal = createBox('hotbarSettingsModal', '1002');
    hotbarSettingsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    hotbarSettingsModal.style.backdropFilter = 'blur(5px)';
    hotbarSettingsModal.style.justifyContent = 'center';
    hotbarSettingsModal.style.alignItems = 'center';

    const toggleshiftSettingsModal = createBox('toggleshiftSettingsModal', '1002');
    toggleshiftSettingsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    toggleshiftSettingsModal.style.backdropFilter = 'blur(5px)';
    toggleshiftSettingsModal.style.justifyContent = 'center';
    toggleshiftSettingsModal.style.alignItems = 'center';

    const EditHud = createBox('EditHud', '1002');
    EditHud.style.backgroundColor = 'transparent';
    EditHud.style.justifyContent = 'space-between';
    EditHud.style.flexDirection = 'column';
    EditHud.style.alignItems = 'center';

    const resolutionSettingsModal = createBox('resolutionSettingsModal', '1002');
    resolutionSettingsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    resolutionSettingsModal.style.backdropFilter = 'blur(5px)';
    resolutionSettingsModal.style.justifyContent = 'center';
    resolutionSettingsModal.style.alignItems = 'center';

    const menuButtonsCon = document.createElement('div');
    menuButtonsCon.style.flexDirection = 'row';
    menuButtonsCon.style.alignItems = 'center';
    menuButtonsCon.style.display = 'flex';
    mainMenu.appendChild(menuButtonsCon);

    const settingsButton = document.createElement('button');
    settingsButton.style.fontSize = '20px';
    settingsButton.style.fontWeight = 'bold';
    settingsButton.style.width = '60px';
    settingsButton.style.height = '60px';
    settingsButton.style.backgroundColor = 'rgba(40, 40, 40, 0.97)';
    settingsButton.style.borderRadius = '10px';
    settingsButton.style.border = '2px solid rgba(50, 50, 50, 0.97)';
    settingsButton.style.outline = '2px solid rgb(30,30,30)';
    settingsButton.style.color = 'white';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.display = 'flex';
    settingsButton.style.alignItems = 'center';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.position = 'relative';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.backgroundImage = 'url(https://i.postimg.cc/MGRs1QCR/settings-icon-1964x2048-8nigtrtt.png)';
    settingsButton.style.position = 'relative';
    settingsButton.style.backgroundRepeat = "no-repeat";
    settingsButton.style.backgroundSize = "40px 40px";
    settingsButton.style.backgroundPosition = 'center';
    settingsButton.addEventListener('mouseover', function() {
        settingsButton.style.outline = '2px solid rgb(255, 255, 255)';
    });
    settingsButton.addEventListener('mouseout', function() {
        settingsButton.style.outline = '2px solid rgb(30, 30, 30)';
    });
    settingsButton.addEventListener('click', function() {
        settingsModal.style.display = 'block';
    });
    menuButtonsCon.appendChild(settingsButton);

    const ModsButton = document.createElement('button');
    ModsButton.textContent = 'MODS';
    ModsButton.style.marginBottom = '10px';
    ModsButton.style.backgroundColor = 'rgba(40, 40, 40, 0.97)';
    ModsButton.style.borderRadius = '10px';
    ModsButton.style.outline = '2px solid rgb(30,30,30)';
    ModsButton.style.border = '2px solid rgba(50, 50, 50, 0.97)';
    ModsButton.style.color = 'white';
    ModsButton.style.width = '180px';
    ModsButton.style.height = '60px';
    ModsButton.style.margin = '0px 10px 0px 10px';
    ModsButton.style.fontSize = '20px';
    ModsButton.style.fontWeight = '300';
    ModsButton.style.cursor = 'pointer';
    ModsButton.addEventListener('mouseover', function() {
        ModsButton.style.outline = '2px solid rgb(255,255,255)';
    });
    ModsButton.addEventListener('mouseout', function() {
        ModsButton.style.outline = '2px solid rgb(30, 30, 30)';
    });
    ModsButton.addEventListener('click', function() {
        mainBox.style.display = 'block';
    });
    menuButtonsCon.appendChild(ModsButton);

    const CosmeticsButton = document.createElement('button');
    CosmeticsButton.style.backgroundColor = 'rgba(40, 40, 40, 0.97)';
    CosmeticsButton.style.borderRadius = '10px';
    CosmeticsButton.style.border = '2px solid rgba(50, 50, 50, 0.97)';
    CosmeticsButton.style.outline = '2px solid rgb(30,30,30)';
    CosmeticsButton.style.color = 'white';
    CosmeticsButton.style.width = '60px';
    CosmeticsButton.style.height = '60px';
    CosmeticsButton.style.fontSize = '20px';
    CosmeticsButton.style.fontWeight = 'bold';
    CosmeticsButton.style.cursor = 'pointer';
    CosmeticsButton.style.display = 'block';
    CosmeticsButton.style.justifyContent = 'center';
    CosmeticsButton.style.backgroundImage = 'url(https://i.postimg.cc/t4RkYc5K/yellow-t-shirt-icon-mds.png)';
    CosmeticsButton.style.position = 'relative';
    CosmeticsButton.style.backgroundRepeat = "no-repeat";
    CosmeticsButton.style.backgroundSize = "45px 40px";
    CosmeticsButton.style.backgroundPosition = 'center';
    CosmeticsButton.addEventListener('mouseover', function() {
        CosmeticsButton.style.outline = '2px solid rgb(255,255,255)';
    });
    CosmeticsButton.addEventListener('mouseout', function() {
        CosmeticsButton.style.outline = '2px solid rgb(30,30,30)';
    });
    CosmeticsButton.addEventListener('click', function() {
        capeModal.style.display = 'flex';
        mainMenu.style.display = 'none'
        mainHud.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';;
        mainHud.style.backdropFilter = 'blur(5px)';
    });
    menuButtonsCon.appendChild(CosmeticsButton);

    const topBar = document.createElement('div');
    topBar.style.display = 'flex';
    topBar.style.alignItems = 'center';
    topBar.style.justifyContent = 'center';
    topBar.style.flexDirection = 'row';
    topBar.style.backgroundColor = 'transparent';
    topBar.style.width = '100%';
    topBar.style.height = '60px';
    topBar.style.marginTop = '-15px';
    topBar.style.borderBottom = '2px solid rgb(60, 60, 60)';
    mainBox.appendChild(topBar);

    const modContainer = document.createElement('div');
    modContainer.style.display = 'flex';
    modContainer.style.flexWrap = 'wrap';
    modContainer.style.gap = '15px';
    modContainer.style.marginTop = '10px';
    mainBox.appendChild(modContainer);

    const modBoxItems = [];
    Mods.forEach((mod, index) => {
        const modBoxItem = document.createElement('div');
        modBoxItem.style.backgroundImage = mod.backgroundImage;
        modBoxItem.style.backgroundSize = '75px 75px';
        modBoxItem.style.backgroundRepeat = "no-repeat";
        modBoxItem.style.backgroundPosition = 'center calc(50% - 10px)';
        modBoxItem.style.height = '165px';
        modBoxItem.style.width = '165px';
        modBoxItem.style.padding = '10px';
        modBoxItem.style.backgroundColor = 'rgb(50, 50, 50)';
        modBoxItem.style.display = 'flex';
        modBoxItem.style.border = '2px solid rgb(60, 60, 60)';
        modBoxItem.style.borderRadius = '10px';
        modBoxItem.style.flexDirection = 'column';
        modBoxItem.style.justifyContent = 'space-between';
        modBoxItem.style.alignItems = 'center';
        modBoxItem.innerHTML = mod.name;
        modBoxItem.dataset.name = mod.name.toLowerCase();
        modBoxItem.dataset.id = index;

        modContainer.appendChild(modBoxItem);
        modBoxItems.push(modBoxItem);
    });

    mainBox.appendChild(modContainer);
    mainHud.appendChild(mainBox);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.alignItems = 'center';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginRight = 'auto';
    buttonsContainer.style.marginTop = '10px';
    buttonsContainer.style.marginLeft = '10px';

    const buttons = ['All', 'New', 'Hud'];
    const buttonElements = {};
    buttons.forEach((name) => {
        const button = document.createElement('button');
        button.textContent = name;
        button.style.backgroundColor = name === 'All' ? '#A52D2D' : 'rgb(50, 50, 50)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.height = "37px";
        button.style.width = "80px";
        button.style.fontWeight = '600';
        button.style.cursor = 'pointer';
        button.addEventListener('click', () => handleButtonClick(name));
        buttonsContainer.appendChild(button);
        buttonElements[name] = button;
    });

    const EditHUDButton = document.createElement('button');
    EditHUDButton.textContent = 'Edit Hud';
    EditHUDButton.style.marginRight = '5px';
    EditHUDButton.style.backgroundColor = 'rgb(50, 50, 50)';
    EditHUDButton.style.borderRadius = '10px';
    EditHUDButton.style.border = 'none';
    EditHUDButton.style.color = 'white';
    EditHUDButton.style.width = '100px';
    EditHUDButton.style.height = '37px';
    EditHUDButton.style.fontWeight = '600';
    EditHUDButton.style.cursor = 'pointer';
    EditHUDButton.addEventListener('click', function() {
        EditHud.style.display = 'flex';
        mainBox.style.display = 'none';
        mainHud.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        mainMenu.style.display = 'none';
    });
    buttonsContainer.appendChild(EditHUDButton);

    const spacer = document.createElement('div');
    spacer.style.flexGrow = '1';

    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search';
    searchBar.style.width = '170px';
    searchBar.style.height = '35px';
    searchBar.style.position = 'absolute';
    searchBar.style.top = '22px';
    searchBar.style.right = '70px';
    searchBar.style.borderRadius = '10px';
    searchBar.style.color = 'white';
    searchBar.style.fontWeight = '600';
    searchBar.style.border = 'none';
    searchBar.style.fontSize = "15px";
    searchBar.style.backgroundColor = 'rgb(50, 50, 50)';
    searchBar.style.paddingLeft = '20px';
    searchBar.style.outline = "none";
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase().trim();

        modBoxItems.forEach((modBoxItem) => {
            if (modBoxItem.dataset.name.includes(query)) {
                modBoxItem.style.display = 'flex';
            } else {
                modBoxItem.style.display = 'none';
            }
        });
    });

    const closeIcon = document.createElement('button');
    closeIcon.textContent = '✖';
    closeIcon.style.position = 'absolute';
    closeIcon.style.width = '37px';
    closeIcon.style.height = '37px';
    closeIcon.style.backgroundColor = 'rgb(50, 50, 50)';
    closeIcon.style.borderRadius = '10px';
    closeIcon.style.top = '22px';
    closeIcon.style.right = '20px';
    closeIcon.style.border = 'none';
    closeIcon.style.fontSize = '16px';
    closeIcon.style.color = 'white';
    closeIcon.style.cursor = 'pointer';
    closeIcon.addEventListener('click', function() {
        mainBox.style.display = 'none';
    });
    topBar.appendChild(closeIcon);

    topBar.appendChild(searchBar);
    topBar.appendChild(buttonsContainer);
    topBar.appendChild(spacer);

    function handleButtonClick(name) {
        modBoxItems.forEach((modBoxItem) => {
            modBoxItem.style.display = 'none';
        });

        buttons.forEach((buttonName) => {
            const button = buttonElements[buttonName];
            button.style.backgroundColor = 'rgb(50, 50, 50)';
        });

        const activeButton = buttonElements[name];
        activeButton.style.backgroundColor = '#A52D2D';

        if (name === 'All') {
            modBoxItems.forEach((modBoxItem) => {
                modBoxItem.style.display = 'flex';
            });
        } else if (name === 'New') {
            const newModBoxItems = [9, 4];
            newModBoxItems.forEach((id) => {
                const modBoxItem = modBoxItems[id];
                if (modBoxItem) {
                    modBoxItem.style.display = 'flex';
                }
            });
        } else if (name === 'Hud') {
            const hudItems = [0, 3, 4, 5, 7];
            hudItems.forEach((id) => {
                const modBoxItem = modBoxItems[id];
                if (modBoxItem) {
                    modBoxItem.style.display = 'flex';
                }
            });
        }

    }

    const ArmorViewButton = document.createElement('button');
    ArmorViewButton.textContent = 'Enabled';
    ArmorViewButton.style.backgroundColor = 'rgb(40, 40, 40)';
    ArmorViewButton.style.borderRadius = '10px';
    ArmorViewButton.style.border = 'none';
    ArmorViewButton.style.color = 'white';
    ArmorViewButton.style.width = '160px';
    ArmorViewButton.style.height = '40px';
    ArmorViewButton.style.fontSize = '18px';
    ArmorViewButton.style.cursor = 'pointer';
    modContainer.children[0].appendChild(ArmorViewButton);

    let selectedItemBoxInterval;
    function createSelectedItemBox() {
        const selectedItemBox = document.createElement('div');
        selectedItemBox.id = 'selected-item-box';
        selectedItemBox.style.position = 'fixed';
        selectedItemBox.style.bottom = '100px';
        selectedItemBox.style.left = '31%';
        selectedItemBox.style.transformX = 'translateX(-28%)';
        selectedItemBox.style.width = '400px';
        selectedItemBox.style.height = '70px';
        selectedItemBox.style.zIndex = '9999';
        selectedItemBox.style.overflow = 'hidden';
        selectedItemBox.style.display = 'flex';
        selectedItemBox.style.alignItems = 'center';
        selectedItemBox.style.justifyContent = 'center';
        mainHud.appendChild(selectedItemBox);

        let isMoving = false;
        let offsetAX = 0;
        let offsetAY = 0;

        selectedItemBox.addEventListener('mousedown', (event) => {
            if (ArmorViewButton.textContent === 'Enabled' && EditHud.style.display === 'flex' && event.target.nodeName !== 'INPUT') {
                isMoving = true;
                offsetAX = event.clientX;
                offsetAX = event.clientY;
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (ArmorViewButton.textContent === 'Enabled' && isMoving) {
                selectedItemBox.style.left = `${event.clientX}px`;
                selectedItemBox.style.top = `${event.clientY}px`;
            }
        });

        document.addEventListener('mouseup', () => isMoving = false);

        function updateSelectedItems() {
            const indices = [46, 47, 48, 49, 50];
            const selectedItemBox = document.getElementById('selected-item-box');
            if (selectedItemBox) {
                selectedItemBox.innerHTML = '';

                indices.forEach(idx => {
                    const selectedItem = document.querySelector(`.InvenItem[data-inven-idx="${idx}"]`);
                    if (selectedItem) {
                        const clonedItem = selectedItem.cloneNode(true);
                        clonedItem.removeAttribute('id');
                        clonedItem.style.zIndex = '0';
                        clonedItem.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));

                        const itemImage = clonedItem.querySelector('.BlockItemWrapper img');
                        if (itemImage) {
                            itemImage.style.maxWidth = '100%';
                            itemImage.style.maxHeight = '100%';
                            itemImage.style.display = 'block';
                            itemImage.style.margin = 'auto';
                            itemImage.style.zIndex = '0';
                        }
                        selectedItemBox.appendChild(clonedItem);
                    }
                });
            }
        }
        selectedItemBoxInterval = setInterval(updateSelectedItems, 1500);
    }
    function removeSelectedItemBox() {
        clearInterval(selectedItemBoxInterval);
        const selectedItemBox = document.getElementById('selected-item-box');
        if (selectedItemBox) {
            selectedItemBox.remove();
        }
    }
    const armorViewState = GM_getValue('armorViewState', 'Enabled');

    if (armorViewState === 'Disabled') {
        ArmorViewButton.textContent = 'Disabled';
    } else {
        createSelectedItemBox();
    }
    ArmorViewButton.addEventListener('click', function() {
        if (ArmorViewButton.textContent === 'Enabled') {
            ArmorViewButton.textContent = 'Disabled';
            removeSelectedItemBox();
            GM_setValue('armorViewState', 'Disabled');
        } else {
            ArmorViewButton.textContent = 'Enabled';
            createSelectedItemBox();
            GM_setValue('armorViewState', 'Enabled');
        }
    });

    const CrosshairButton = document.createElement('button');
    CrosshairButton.textContent = 'Customize'
    CrosshairButton.style.backgroundColor = 'rgb(40, 40, 40)';
    CrosshairButton.style.borderRadius = '10px';
    CrosshairButton.style.border = 'none';
    CrosshairButton.style.color = 'white';
    CrosshairButton.style.fontSize = '18px';
    CrosshairButton.style.width = '160px';
    CrosshairButton.style.height = '40px';
    CrosshairButton.style.cursor = 'pointer';
    CrosshairButton.addEventListener('click', function() {
        crosshairSettingsModal.style.display = 'block';
    });
    modContainer.children[2].appendChild(CrosshairButton);

    const CpsCounterButton = document.createElement('button');
    CpsCounterButton.textContent = 'Enabled';
    CpsCounterButton.style.backgroundColor = 'rgb(40, 40, 40)';
    CpsCounterButton.style.borderRadius = '10px';
    CpsCounterButton.style.border = 'none';
    CpsCounterButton.style.color = 'white';
    CpsCounterButton.style.width = '160px';
    CpsCounterButton.style.height = '40px';
    CpsCounterButton.style.fontSize = '18px';
    CpsCounterButton.style.cursor = 'pointer';
    modContainer.children[4].appendChild(CpsCounterButton);

    let cpsCounter;
    let leftClickTimes = [];
    let rightClickTimes = [];
    let cpsInterval = null;
    let clickListener = null;

    const CpsCounterState = GM_getValue('CpsCounterState', 'Enabled');
    if (CpsCounterState === 'Enabled') {
        CpsCounterButton.textContent = 'Enabled';
        createCPSCounter();
        startCPSCounter();
    } else {
        CpsCounterButton.textContent = 'Disabled';
    }

    function createCPSCounter() {
        cpsCounter = document.createElement('div');
        cpsCounter.style.position = 'fixed';
        cpsCounter.style.top = '96%';
        cpsCounter.style.left = '94.5%';
        cpsCounter.style.padding = '5px 10px';
        cpsCounter.style.backgroundColor = '#00000066';
        cpsCounter.style.color = 'white';
        cpsCounter.style.fontSize = '16px';
        cpsCounter.style.zIndex = '1000';
        cpsCounter.innerText = 'CPS: 0 | 0';
        cpsCounter.style.cursor = 'pointer';
        mainHud.appendChild(cpsCounter);

        let isMoving = false;
        let offsetCX = 0;
        let offsetCY = 0;

        cpsCounter.addEventListener('mousedown', (event) => {
            if (CpsCounterButton.textContent === 'Enabled' && EditHud.style.display === 'flex' && event.target.nodeName !== 'INPUT') {
                isMoving = true;
                offsetCX = event.clientX;
                offsetCX = event.clientY;
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (CpsCounterButton.textContent === 'Enabled' && isMoving) {
                cpsCounter.style.left = `${event.clientX}px`;
                cpsCounter.style.top = `${event.clientY}px`;
            }
        });

        document.addEventListener('mouseup', () => isMoving = false);

    }

    function startCPSCounter() {
        function countClick(event) {
            const currentTime = new Date().getTime();
            if (event.button === 0) {
                leftClickTimes.push(currentTime);
            } else if (event.button === 2) {
                rightClickTimes.push(currentTime);
            }
            updateCPS();
        }

        function updateCPS() {
            const currentTime = new Date().getTime();
            const oneSecondAgo = currentTime - 1000;
            leftClickTimes = leftClickTimes.filter(time => time >= oneSecondAgo);
            rightClickTimes = rightClickTimes.filter(time => time >= oneSecondAgo);
            cpsCounter.innerText = `CPS: ${leftClickTimes.length} | ${rightClickTimes.length}`;
        }
        clickListener = function(event) {
            if (event.button === 0 || event.button === 2) {
                countClick(event);
            }
        };
        document.addEventListener('mousedown', clickListener);
        cpsInterval = setInterval(updateCPS, 1000);
    }

    CpsCounterButton.addEventListener('click', function() {
        if (CpsCounterButton.textContent === 'Disabled') {
            CpsCounterButton.textContent = 'Enabled';
            createCPSCounter();
            GM_setValue('CpsCounterState', 'Enabled');
            startCPSCounter();
        } else {
            CpsCounterButton.textContent = 'Disabled';
            GM_setValue('CpsCounterState', 'Disabled');

            if (cpsInterval) {
                clearInterval(cpsInterval);
                cpsInterval = null;
            }
            if (clickListener) {
                document.removeEventListener('mousedown', clickListener);
                clickListener = null;
            }
            if (cpsCounter) {
                cpsCounter.remove();
                cpsCounter = null;
            }
            leftClickTimes = [];
            rightClickTimes = [];
        }
    });

    const PingCounterButton = document.createElement('button');
    PingCounterButton.textContent = 'Disabled';
    PingCounterButton.style.backgroundColor = 'rgb(40, 40, 40)';
    PingCounterButton.style.borderRadius = '10px';
    PingCounterButton.style.border = 'none';
    PingCounterButton.style.color = 'white';
    PingCounterButton.style.width = '160px';
    PingCounterButton.style.height = '40px';
    PingCounterButton.style.fontSize = '18px';
    PingCounterButton.style.cursor = 'pointer';
    modContainer.children[5].appendChild(PingCounterButton);

    class PingCounter {
        constructor(url) {
            this.pingCount = 0;
            this.url = url;
            this.pingInterval = null;
            this.pingTimeDisplay = document.createElement('div');
            this.pingTimeDisplay.id = 'pingTimeDisplay';
            this.pingTimeDisplay.innerText = 'Ping : ';
            this.pingTimeDisplay.style.display = 'none';
            this.pingTimeDisplay.style.cursor = 'pointer';
            this.pingTimeDisplay.style.position = 'fixed';
            this.pingTimeDisplay.style.top = '96%';
            this.pingTimeDisplay.style.left = '87.3%';
            this.pingTimeDisplay.style.padding = '5px 10px';
            this.pingTimeDisplay.style.backgroundColor = '#00000066';
            this.pingTimeDisplay.style.color = 'white';
            this.pingTimeDisplay.style.fontSize = '16px';
            this.pingTimeDisplay.style.zIndex = '1000';
            mainHud.appendChild(this.pingTimeDisplay);

            let isMoving = false;
            let offsetPX = 0;
            let offsetPY = 0;

            this.pingTimeDisplay.addEventListener('mousedown', (event) => {
                if (PingCounterButton.textContent === 'Enabled' && EditHud.style.display === 'flex' && event.target.nodeName !== 'INPUT') {
                    isMoving = true;
                    offsetPX = event.clientX;
                    offsetPX = event.clientY;
                }
            });

            document.addEventListener('mousemove', (event) => {
                if (PingCounterButton.textContent === 'Enabled' && isMoving) {
                    this.pingTimeDisplay.style.left = `${event.clientX}px`;
                    this.pingTimeDisplay.style.top = `${event.clientY}px`;
                }
            });

            document.addEventListener('mouseup', () => isMoving = false);

        }
        ping() {
            const start = new Date().getTime();
            fetch(this.url, { method: 'HEAD', mode: 'no-cors' })
                .then(() => {
                const end = new Date().getTime();
                const pingTime = end - start;

                this.pingTimeDisplay.innerText = `Ping : ${pingTime} ms`;
                this.pingCount++;
            })
                .catch((error) => {
                console.error('Ping failed:', error);
            });
        }
        startPinging(interval) {
            this.ping();
            this.pingInterval = setInterval(() => this.ping(), interval);
        }
        stopPinging() {
            clearInterval(this.pingInterval);
            this.pingTimeDisplay.style.display = 'none';
        }
    }
    const pingCounter = new PingCounter('https://bloxd.io');
    const PingCounterState = GM_getValue('PingCounterState', 'Disabled');
    if (PingCounterState === 'Enabled') {
        PingCounterButton.textContent = 'Enabled';
        pingCounter.startPinging(1500);
        pingCounter.pingTimeDisplay.style.display = 'block';
    } else {
        PingCounterButton.textContent = 'Disabled';
    }
    PingCounterButton.addEventListener('click', () => {
        if (PingCounterButton.textContent === 'Disabled') {
            PingCounterButton.textContent = 'Enabled';
            GM_setValue('PingCounterState', 'Enabled');
            pingCounter.startPinging(1500);
            pingCounter.pingTimeDisplay.style.display = 'block';
        } else {
            PingCounterButton.textContent = 'Disabled';
            GM_setValue('PingCounterState', 'Disabled');
            pingCounter.stopPinging();
        }
    });

    const toggleshiftButtonContainer = document.createElement('div');
    toggleshiftButtonContainer.style.display = 'flex';
    toggleshiftButtonContainer.style.justifyContent = 'space-between';
    toggleshiftButtonContainer.style.width = '100%';

    const toggleshiftToggleButton = document.createElement('button');
    toggleshiftToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    toggleshiftToggleButton.style.borderRadius = '10px';
    toggleshiftToggleButton.style.border = 'none';
    toggleshiftToggleButton.style.color = 'white';
    toggleshiftToggleButton.style.width = '100px';
    toggleshiftToggleButton.style.height = '40px';
    toggleshiftToggleButton.style.fontSize = '18px';
    toggleshiftToggleButton.style.cursor = 'pointer';
    toggleshiftButtonContainer.appendChild(toggleshiftToggleButton);

    const toggleshiftSettingsButton = document.createElement('button');
    toggleshiftSettingsButton.innerHTML = '⚙';
    toggleshiftSettingsButton.style.backgroundColor = 'rgb(40, 40, 40)';
    toggleshiftSettingsButton.style.borderRadius = '10px';
    toggleshiftSettingsButton.style.border = 'none';
    toggleshiftSettingsButton.style.color = 'white';
    toggleshiftSettingsButton.style.fontSize = '24px';
    toggleshiftSettingsButton.style.width = '40px';
    toggleshiftSettingsButton.style.height = '40px';
    toggleshiftSettingsButton.style.cursor = 'pointer';
    toggleshiftSettingsButton.addEventListener('click', function () {
        toggleshiftSettingsModal.style.display = 'flex';
    });
    toggleshiftButtonContainer.appendChild(toggleshiftSettingsButton);
    modContainer.children[1].appendChild(toggleshiftButtonContainer);

    let togglesprintKey = GM_getValue('togglesprintKey', 'KeyF');
    let toggleKey = GM_getValue('menuToggleKey', 'ShiftRight');
    let isRunning = '';
    let isKeepingRunning = false;
    const shiftKeyData = {
        key: 'Shift',
        code: 'ShiftLeft',
        keyCode: 16,
        which: 16,
        shiftKey: true,
        ControlKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        bubbles: true,
        cancelable: true
    };
    const shiftDown = new KeyboardEvent('keydown', shiftKeyData);
    const shiftUp = new KeyboardEvent('keyup', shiftKeyData);
    const toggleSprintState = GM_getValue('toggleSprintState', 'Enabled');

    toggleshiftToggleButton.textContent = toggleSprintState;
    document.addEventListener('keyup', e => {
        if (toggleshiftToggleButton.textContent === 'Enabled') {
            if (e.code === togglesprintKey) {
                if (!isRunning) {
                    isRunning = 'Shift';
                    isKeepingRunning = true;
                    document.dispatchEvent(shiftDown);
                } else {
                    isRunning = '';
                    isKeepingRunning = false;
                    document.dispatchEvent(shiftUp);
                }
            } else if (e.code === 'ShiftLeft' && isRunning === 'Shift') {
                if (isKeepingRunning) {
                    e.stopImmediatePropagation();
                    return;
                }
                isRunning = '';
            }
        }
    });
    document.addEventListener('keydown', e => {
        if (toggleshiftToggleButton.textContent === 'Enabled') {
            if (e.code === 'ShiftLeft' && !isRunning) {
                isRunning = 'Shift';
            }
        }
    });

    setInterval(() => {
        if (isKeepingRunning && toggleshiftToggleButton.textContent === 'Enabled') {
            document.dispatchEvent(shiftDown);
        }
    }, 100);
    toggleshiftToggleButton.addEventListener('click', () => {
        if (toggleshiftToggleButton.textContent === 'Disabled') {
            toggleshiftToggleButton.textContent = 'Enabled';
            GM_setValue('toggleSprintState', 'Enabled');
        } else {
            toggleshiftToggleButton.textContent = 'Disabled';
            GM_setValue('toggleSprintState', 'Disabled');
            isRunning = '';
            isKeepingRunning = false;
            document.dispatchEvent(shiftUp);
        }
    });

    let messageSent = false;
    const sendMessageToChat = (msg) => {
        const chat = document.querySelector(".ChatMessages");
        if (chat) {
            const div = document.createElement("div");
            div.className = "MessageWrapper";
            div.innerHTML = `<div class="TextFromServer undefined"><div class="IndividualText undefined cyan-text">${msg}</div></div>`;
            chat.appendChild(div);
        }
    };
    const updateGameStatus = () => {
        const inMenu = document.querySelector('.Title.FullyFancyText');
        if (!inMenu && !messageSent) {
            sendMessageToChat("Welcome To Deep Space Client");
            messageSent = true;
        } else if (inMenu) {
            messageSent = false;
        }
    };

    const cinematicToggleButton = document.createElement('button');
    cinematicToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    cinematicToggleButton.style.borderRadius = '10px';
    cinematicToggleButton.style.border = 'none';
    cinematicToggleButton.style.color = 'white';
    cinematicToggleButton.style.width = '160px';
    cinematicToggleButton.style.height = '40px';
    cinematicToggleButton.style.fontSize = '18px';
    cinematicToggleButton.style.cursor = 'pointer';

    const cinematicModeState = GM_getValue('cinematicModeState', 'Enabled');

    cinematicToggleButton.textContent = cinematicModeState;

    cinematicToggleButton.addEventListener('click', function () {
        if (cinematicToggleButton.textContent === 'Enabled') {
            cinematicToggleButton.textContent = 'Disabled';
            GM_setValue('cinematicModeState', 'Disabled');
        } else {
            cinematicToggleButton.textContent = 'Enabled';
            GM_setValue('cinematicModeState', 'Enabled');
        }
    });

    modContainer.children[6].appendChild(cinematicToggleButton);

    document.addEventListener('keydown', function (event) {
        const inMenu = document.querySelector('.Title.FullyFancyText');
        if (inMenu) return;

        const key = event.key;
        const wholeAppWrapper = document.querySelector('.WholeAppWrapper');

        if (cinematicToggleButton.textContent === 'Enabled' && (key === 'h' || key === 'H')) {
            wholeAppWrapper.style.visibility = wholeAppWrapper.style.visibility === 'hidden' ? 'visible' : 'hidden';
            mainHud.style.visibility = mainHud.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }
    });

    setInterval(updateGameStatus, 2000);
    updateGameStatus();

    const style = document.createElement("style");
    style.textContent = `.cyan-text { color: rgb(0, 255, 255) !important; }`;
    document.head.appendChild(style);

    const hotbarSettingsButton = document.createElement('button');
    hotbarSettingsButton.textContent = 'Customize';
    hotbarSettingsButton.style.backgroundColor = 'rgb(40, 40, 40)';
    hotbarSettingsButton.style.borderRadius = '10px';
    hotbarSettingsButton.style.border = 'none';
    hotbarSettingsButton.style.color = 'white';
    hotbarSettingsButton.style.fontSize = '18px';
    hotbarSettingsButton.style.width = '160px';
    hotbarSettingsButton.style.height = '40px';
    hotbarSettingsButton.style.cursor = 'pointer';
    hotbarSettingsButton.addEventListener('click', function() {
        hotbarSettingsModal.style.display = 'flex';
    });
    modContainer.children[8].appendChild(hotbarSettingsButton);

    const keystrokeToggleButton = document.createElement('button');
    keystrokeToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    keystrokeToggleButton.style.borderRadius = '10px';
    keystrokeToggleButton.style.border = 'none';
    keystrokeToggleButton.style.color = 'white';
    keystrokeToggleButton.style.width = '160px';
    keystrokeToggleButton.style.height = '40px';
    keystrokeToggleButton.style.fontSize = '18px';
    keystrokeToggleButton.style.cursor = 'pointer';
    modContainer.children[7].appendChild(keystrokeToggleButton);

    const keystrokeModeState = GM_getValue('keystrokeModeState', 'Enabled');
    keystrokeToggleButton.textContent = keystrokeModeState;
    keystrokeToggleButton.addEventListener('click', function () {
        if (keystrokeToggleButton.textContent === 'Enabled') {
            keystrokeToggleButton.textContent = 'Disabled';
            GM_setValue('keystrokeModeState', 'Disabled');
            resetKeyStyles();
            setKeysVisibility(false);
        } else {
            keystrokeToggleButton.textContent = 'Enabled';
            GM_setValue('keystrokeModeState', 'Enabled');
            setKeysVisibility(true);
        }
    });
    function getBindingCodes(bindingKey, defaultCodes) {
        const fallback = Array.isArray(defaultCodes) ? defaultCodes : [defaultCodes];
        try {
            const raw = localStorage[bindingKey][0];
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return fallback;
            const codes = parsed.filter(c => typeof c === 'string');
            return codes.length ? codes : fallback;
        } catch (e) {
            return fallback;
        }
    }
    const forwardCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-forward', 'KeyW'));
    const leftCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-left', 'KeyA'));
    const backwardCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-backward', 'KeyS'));
    const rightCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-right', 'KeyD'));
    const primaryFireCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-primary-fire', 'Mouse1'));
    const altFireCodes = getCodeDisplayName(getBindingCodes('bloxd-bindings-alt-fire', 'Mouse3'));
    const keys = [
        { key: forwardCodes, codes: getBindingCodes('bloxd-bindings-forward', 'KeyW'), top: '5px', left: '50%' },
        { key: leftCodes, codes: getBindingCodes('bloxd-bindings-left', 'KeyA'), top: '60px', left: '31.5%' },
        { key: backwardCodes, codes: getBindingCodes('bloxd-bindings-backward', 'KeyS'), top: '60px', left: '50%' },
        { key: rightCodes, codes: getBindingCodes('bloxd-bindings-right', 'KeyD'), top: '60px', left: '68%' },
        { key: primaryFireCodes, codes: getBindingCodes('bloxd-bindings-primary-fire', 'Mouse1'), top: '115px', left: '35.5%', width: '77px' },
        { key: altFireCodes, codes: getBindingCodes('bloxd-bindings-alt-fire', 'Mouse3'), top: '115px', left: '64%', width: '77px' },
        { key: '―――', codes: ['Space'], top: '170px', left: '50%', height: '25px', width: '160px', fontSize: '18px' }
    ];
    const container = document.createElement("div");
    Object.assign(container.style, {
        zIndex: "10000",
        width: "300px",
        height: "300px",
        transform: "translate(-50%, -50%)",
        top: "91%",
        left: "4.7%",
        position: "fixed",
        opacity: "70%",
        cursor: 'pointer'
    });
    mainHud.appendChild(container);

    let isMoving = false;
    let offsetX = 0;
    let offsetY = 0;

    container.addEventListener('mousedown', (event) => {
        if (keystrokeToggleButton.textContent === 'Enabled' && EditHud.style.display === 'flex' && event.target.nodeName !== 'INPUT') {
            isMoving = true;
            offsetX = event.clientX;
            offsetY = event.clientY;
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (keystrokeToggleButton.textContent === 'Enabled' && isMoving) {
            container.style.left = `${event.clientX}px`;
            container.style.top = `${event.clientY}px`;
        }
    });

    document.addEventListener('mouseup', () => isMoving = false);

    const createKeyElement = ({ key, top, left, width = '50px', height = '50px', fontSize = '24px' }) => {
        const element = document.createElement('div');
        Object.assign(element.style, {
            position: 'fixed',
            color: 'white',
            top,
            left,
            transform: 'translateX(-50%)',
            zIndex: '10000',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            transition: 'all 0.15s ease-in-out',
            fontSize,
            height,
            width,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            lineHeight: height
        });
        element.textContent = key;
        container.appendChild(element);
        return element;
    };
    const keyElements = keys.reduce((acc, keyConfig) => {
        acc[keyConfig.key] = createKeyElement(keyConfig);
        return acc;
    }, {});
    const keyCodeToLabel = {};
    const mouseButtonToLabel = {};
    keys.forEach(keyConfig => {
        keyConfig.codes.forEach(code => {
            if (code.startsWith('Mouse')) {
                const button = parseInt(code.slice(5), 10) - 1;
                mouseButtonToLabel[button] = keyConfig.key;
            } else {
                keyCodeToLabel[code] = keyConfig.key;
            }
        });
    });
    const updateKeyStyle = (key, active) => {
        if (keystrokeToggleButton.textContent === 'Enabled') {
            keyElements[key].style.backgroundColor = active ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
            keyElements[key].style.color = active ? "black" : "white";
        }
    };
    const resetKeyStyles = () => {
        Object.keys(keyElements).forEach(key => {
            keyElements[key].style.backgroundColor = "rgba(0, 0, 0, 0.6)";
            keyElements[key].style.color = "white";
        });
    };
    const setKeysVisibility = (visible) => {
        Object.values(keyElements).forEach(element => {
            element.style.display = visible ? 'block' : 'none';
        });
    };
    if (keystrokeToggleButton.textContent === 'Disabled') {
        setKeysVisibility(false);
    }
    document.addEventListener('keydown', (e) => {
        if (keystrokeToggleButton.textContent === 'Enabled' && document.pointerLockElement) {
            const label = keyCodeToLabel[e.code];
            if (label) updateKeyStyle(label, true);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (keystrokeToggleButton.textContent === 'Enabled' && document.pointerLockElement) {
            const label = keyCodeToLabel[e.code];
            if (label) updateKeyStyle(label, false);
        }
    });
    document.addEventListener('mousedown', ({ button }) => {
        if (keystrokeToggleButton.textContent === 'Enabled') {
            const label = mouseButtonToLabel[button];
            if (label) updateKeyStyle(label, true);
        }
    });
    document.addEventListener('mouseup', ({ button }) => {
        if (keystrokeToggleButton.textContent === 'Enabled') {
            const label = mouseButtonToLabel[button];
            if (label) updateKeyStyle(label, false);
        }
    });

    const HandItemToggleButton = document.createElement('button');
    HandItemToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    HandItemToggleButton.style.borderRadius = '10px';
    HandItemToggleButton.style.border = 'none';
    HandItemToggleButton.style.color = 'white';
    HandItemToggleButton.style.width = '160px';
    HandItemToggleButton.style.height = '40px';
    HandItemToggleButton.style.fontSize = '18px';
    HandItemToggleButton.style.cursor = 'pointer';
    modContainer.children[3].appendChild(HandItemToggleButton);

    let isHandItemBoxEnabled = GM_getValue('HandItemBoxState', true);

    HandItemToggleButton.textContent = isHandItemBoxEnabled ? 'Enabled' : 'Disabled';

    function createHandItemBox() {
        const HandItemBox = document.createElement('div');
        HandItemBox.id = 'hand-item-box';
        HandItemBox.style.position = 'fixed';
        HandItemBox.style.bottom = '105px';
        HandItemBox.style.left = '28%';
        HandItemBox.style.width = '60px';
        HandItemBox.style.height = '60px';
        HandItemBox.style.zIndex = '9999';
        HandItemBox.style.overflow = 'hidden';
        HandItemBox.style.display = 'flex';
        HandItemBox.style.alignItems = 'center';
        HandItemBox.style.justifyContent = 'center';
        HandItemBox.style.cursor = 'pointer';

        mainHud.appendChild(HandItemBox);

        let isMoving = false;
        let OffsetHX = 0;
        let OffsetHY = 0;

        HandItemBox.addEventListener('mousedown', (e) => {
            if (HandItemToggleButton.textContent === 'Enabled' && EditHud.style.display === 'flex' && e.target.nodeName !== 'INPUT') {
                isMoving = true;
                OffsetHX = e.clientX;
                OffsetHY = e.clientY;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (HandItemToggleButton.textContent === 'Enabled' && isMoving) {
                HandItemBox.style.left = `${e.clientX}px`;
                HandItemBox.style.top = `${e.clientY}px`;
            }
        });

        document.addEventListener('mouseup', () => isMoving = false);
    }

    function updateHandItems() {
        const HandItemBox = document.getElementById('hand-item-box');
        if (HandItemBox) {
            HandItemBox.innerHTML = '';

            const HandItems = document.querySelectorAll('.SelectedItem');
            HandItems.forEach(HandItem => {
                const clonedHItem = HandItem.cloneNode(true);
                clonedHItem.removeAttribute('id');
                clonedHItem.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
                Object.assign(clonedHItem.style, {
                    position: 'static',
                    margin: '0',
                    padding: '0',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box'
                });

                HandItemBox.appendChild(clonedHItem);
            });
        }
    }

    HandItemToggleButton.addEventListener('click', function () {
        isHandItemBoxEnabled = !isHandItemBoxEnabled;
        GM_setValue('HandItemBoxState', isHandItemBoxEnabled);

        if (isHandItemBoxEnabled) {
            HandItemToggleButton.textContent = 'Enabled';
            createHandItemBox();
            setInterval(updateHandItems, 1500);
        } else {
            HandItemToggleButton.textContent = 'Disabled';
            const existingBox = document.getElementById('hand-item-box');
            if (existingBox) {
                existingBox.remove();
            }
        }
    });

    if (isHandItemBoxEnabled) {
        createHandItemBox();
        setInterval(updateHandItems, 1500);
    }

    const resolution2Text = document.createElement('span');
    resolution2Text.textContent = 'ADJUSTER';
    resolution2Text.style.marginTop = '-93px';
    modContainer.children[9].appendChild(resolution2Text);

    const resolutionButtonContainer = document.createElement('div');
    resolutionButtonContainer.style.display = 'flex';
    resolutionButtonContainer.style.justifyContent = 'space-between';
    resolutionButtonContainer.style.width = '100%';

    const resolutionToggleButton = document.createElement('button');
    const resolutionState = GM_getValue('resolutionToggleState', 'Enabled');
    resolutionToggleButton.textContent = resolutionState;
    resolutionToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    resolutionToggleButton.style.borderRadius = '10px';
    resolutionToggleButton.style.border = 'none';
    resolutionToggleButton.style.color = 'white';
    resolutionToggleButton.style.width = '100px';
    resolutionToggleButton.style.height = '40px';
    resolutionToggleButton.style.fontSize = '18px';
    resolutionToggleButton.style.cursor = 'pointer';
    resolutionToggleButton.addEventListener('click', function() {
        if (resolutionToggleButton.textContent === 'Enabled') {
            resolutionToggleButton.textContent = 'Disabled';
            GM_setValue('resolutionToggleState', 'Disabled');
        } else {
            resolutionToggleButton.textContent = 'Enabled';
            GM_setValue('resolutionToggleState', 'Enabled');
        }
    });
    resolutionButtonContainer.appendChild(resolutionToggleButton);

    const resolutionSettingsButton = document.createElement('button');
    resolutionSettingsButton.innerHTML = '⚙';
    resolutionSettingsButton.style.backgroundColor = 'rgb(40, 40, 40)';
    resolutionSettingsButton.style.borderRadius = '10px';
    resolutionSettingsButton.style.border = 'none';
    resolutionSettingsButton.style.color = 'white';
    resolutionSettingsButton.style.fontSize = '24px';
    resolutionSettingsButton.style.width = '40px';
    resolutionSettingsButton.style.height = '40px';
    resolutionSettingsButton.style.cursor = 'pointer';
    resolutionSettingsButton.addEventListener('click', function() {
        resolutionSettingsModal.style.display = 'flex';
    });
    resolutionButtonContainer.appendChild(resolutionSettingsButton);
    modContainer.children[9].appendChild(resolutionButtonContainer);

    const ogMenuToggleButton = document.createElement('button');

    ogMenuToggleButton.style.backgroundColor = 'rgb(40, 40, 40)';
    ogMenuToggleButton.style.borderRadius = '10px';
    ogMenuToggleButton.style.border = 'none';
    ogMenuToggleButton.style.color = 'white';
    ogMenuToggleButton.style.fontSize = '18px';
    ogMenuToggleButton.style.width = '160px';
    ogMenuToggleButton.style.height = '40px';
    ogMenuToggleButton.style.cursor = 'pointer';

    modContainer.children[10].appendChild(ogMenuToggleButton);


    let ogMenuState = GM_getValue('ogMenuState', true);
    ogMenuToggleButton.textContent = ogMenuState ? 'Enabled' : 'Disabled';
    function applyOGMenu() {
        if (!ogMenuState) return;

        const body = document.querySelector(
            ".EverythingMenuContainer .EverythingMenuBody"
        );

        if (body) {
            body.style.height = "100%";
            body.style.width = "100%";
        }

        const everythingmenu = document.querySelector(
            ".EverythingMenuContainer .EverythingMenu"
        );

        if (everythingmenu) {
            everythingmenu.style.alignItems = "center";
            everythingmenu.style.display = "flex";
            everythingmenu.style.flexDirection = "column";
            everythingmenu.style.height = "80%";
            everythingmenu.style.justifyContent = "center";
            everythingmenu.style.width = "57%";
            everythingmenu.style.position = "absolute";
            everythingmenu.style.left = "50%";
            everythingmenu.style.top = "50%";
            everythingmenu.style.transform = "translate(-50%,-50%)";
        }

        const leaderboard = document.querySelector(
            ".EverythingMenuContainer .EverythingMenu .LobbyLeaderboardContainer"
        );

        if (leaderboard) {
            leaderboard.style.boxSizing = "border-box";
            leaderboard.style.flex = "1 0 1rem";
            leaderboard.style.overflowX = "hidden";
            leaderboard.style.overflowY = "auto";
            leaderboard.style.paddingTop = "1.5rem";
            leaderboard.style.width = "100%";
        }

        const closeBtn = document.querySelector(
            ".EverythingMenuContainer .EverythingMenu .EverythingMenuCloseButtonClickZone"
        );

        if (closeBtn) {
            closeBtn.style.width = "0%";
            closeBtn.style.height = "0%";
            closeBtn.style.opacity = "0";
            closeBtn.style.padding = "0rem";
        }
    }

    ogMenuToggleButton.addEventListener('click', () => {
        ogMenuState = !ogMenuState;

        GM_setValue('ogMenuState', ogMenuState);

        ogMenuToggleButton.textContent = ogMenuState
            ? 'Enabled'
        : 'Disabled';

        if (ogMenuState) {
            applyOGMenu();
        }
    });

    const ogMenuObserver = new MutationObserver(() => {
        if (ogMenuState) {
            applyOGMenu();
        }
    });

    ogMenuObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    applyOGMenu();

    capeModal.innerHTML = `
      <div style="width: 400px;">
    <label>CAPES</label>
    <button id="closeCapeSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
<div style="display: flex; flex-direction: column; align-items: center; width: 385px; min-height: 215px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px; padding: 10px 0;">
  <label style="margin-bottom: 5px; font-weight: 700;">PICK YOUR CAPE</label>
  <div style="display: flex; flex-direction: row; align-items: center; width: 370px; gap:15px;">
<div id="customCapeGrid" style="display:flex; flex-wrap:wrap; gap:15px; width:370px; justify-content:center;"></div>
        </div>
    </div>
    </div>
`;
    function buildCapeButtons() {
        const grid = document.getElementById('customCapeGrid');
        grid.innerHTML = '';
        // Every cape texture shares the same 1296x1296 layout, with the visible
        // front-of-cape art occupying a fixed 496x869 rect anchored at the
        // texture's top-left corner. Scale so that 869px band == button height
        // (80px), so the whole cape front fits with nothing cropped off — then
        // shift right to center the narrower 496px width in the square button.
        const PREVIEW_ZOOM = '149.1%'; // 1296 * (80/869) / 80 * 100
        const PREVIEW_POSITION = '17px 0px'; // centers the 496px-wide crop horizontally

        customCapes.forEach(cape => {
            const btn = document.createElement('button');
            Object.assign(btn.style, {
                width: '80px', height: '80px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgb(40,40,40)',
                border: cape.id === capesvalue ? '2px solid white' : 'none',
                padding: '0', overflow: 'hidden', position: 'relative'
            });
            btn.title = cape.name;

            if (cape.texture) {
                Object.assign(btn.style, {
                    backgroundImage: `url(${cape.texture})`,
                    backgroundSize: `${PREVIEW_ZOOM} ${PREVIEW_ZOOM}`,
                    backgroundPosition: PREVIEW_POSITION,
                    backgroundRepeat: 'no-repeat'
                });
            }

            btn.addEventListener('click', () => {
                capesvalue = cape.id;
                GM_setValue('capes', capesvalue);
                appliedCapeId = null;
                modifyCape(); // apply right away instead of waiting for the next poll
                grid.querySelectorAll('button').forEach(b => b.style.border = 'none');
                btn.style.border = '2px solid white';
            });
            grid.appendChild(btn);
        });
    }
    buildCapeButtons();

    resolutionSettingsModal.innerHTML = `
<div style="width: 400px; height: 200px;">
    <label>RESOLUTION ADJUSTER</label>
    <button id="closeResolutionSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
    <div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label style="margin-bottom: 5px; font-weight: 700;">ADJUST THE RESOLUTION</label>
        <label style="margin-bottom: 5px; font-size: 13px;">The lower the resolution, the higher the FPS.</label>
        <input type="range" id="resolutionSlider" min="0.05" max="1.0" step="0.05" value="1.0" style="width: 70%; appearance: none; height: 10px; background: linear-gradient(to right, #007bff 100%, #323232 0%); border-radius: 5px; outline: none; cursor: pointer; transition: background 0.3s ease;">
        <div>
            <label id="resolutionValueLabel">Resolution: 1.00x</label>
        </div>
    </div>
</div>
`;
    hotbarSettingsModal.innerHTML = `
          <div style=" width: 400px; height: 200px;">
    <label>HOTBAR</label>
    <button id="closeHotbarSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
<div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
  <label style="margin-bottom: 5px; font-weight: 700;">CUSTOMIZE HOTBAR</label>
         <label style="margin-bottom: 5px;">Set hotbar and selected hotbar color</label>
        <label for="colorPicker1">Hotbar:</label>
        <input type="color" id="colorPicker1" name="colorPicker1" value="#0000000" style="background: rgb(50, 50, 50); cursor: pointer; border: none; height: 30px;">
        <label for="colorPicker2">Selected hotbar :</label>
  <input type="color" id="colorPicker2" name="colorPicker2" value="#ffffff" style="background: rgb(50, 50, 50); cursor: pointer; border: none; height: 30px;">
    </div>
    </div>
`;
    EditHud.innerHTML = `
<label style="font-size: 30px; font-weight: bolder; text-shadow: 0px 5px 5px black;">✎EDIT THE HUD✎</label>
    <button id="CommitChanges" style=" background: rgba(40, 40, 40, 0.97) ; width:300px; height :60px; border: 2px solid rgba(50, 50, 50, 0.97); outline :2px solid rgb(30,30,30); border-radius :10px; color: white; cursor: pointer; font-size :15px; font-weight:bolder;">COMMIT CHANGES</button>
    `;
    toggleshiftSettingsModal.innerHTML = `
      <div style=" width: 400px; height: 200px;">
    <label>TOGGLE SPRINT</label>
    <button id="closetoggleshiftSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
    <div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
    <label style="margin-bottom: 5px; font-weight: 700;">TOGGLE KEY</label>
    <label style="margin-bottom: 5px;">Set toggle key for toggle Sprint</label>
        <input type="text" id="customSprintKey" value="${togglesprintKey}" style="height:30px; width: 100px; text-align: center; font-weight: bolder; margin-bottom: 10px; background: rgb(40, 40, 40); border:none; color:white; border-radius: 5px; cursor: pointer;" readonly>
    </div>
    </div>
        `;
    settingsModal.innerHTML = `
         <label">SETTINGS</label>
        <button id="closeSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
        <div style="display: flex; flex-direction: row; gap: 15px; margin-top : 5px; margin-bottom : 10px;">
        <div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px; margin-top: 5px;">
<label style="margin-bottom: 10px; font-weight: 700;">TOGGLE KEY</label>
        <label for="customKey" style="margin-bottom: 5px;">Set toggle key for the client menu:</label>
        <input type="text" id="customKey" value="${toggleKey}" style="height:30px; width: 100px; text-align: center; font-weight: bolder; margin-bottom: 10px; background: rgb(40, 40, 40); border:none; color:white; border-radius: 5px;" readonly>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px; margin-top: 5px;">
        <label style=" font-size: 15px; margin-bottom: 10px; font-weight: 700;" >DEEP SPACE CONTROLS</label>
        <label>Client Menu : Right Shift</label>
        <label>Toggle Sprint : F</label>
        <label>Cinematic Mode : H</label>
        </div>
        </div>
         <div style="display: flex; flex-direction: row; gap: 15px; margin-top : 5px; margin-bottom : 10px;">
        <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px; margin-top: 5px;">
        <label style=" font-size: 15px; margin-bottom: 10px; font-weight: 700;" >CURRENT VERSION</label>
        <label>Version : 1.4.2</label>
        <label style="color: cyan ; font-size: 14px;">Patch Update</label>
        <button id="UpdateButton" style="margin-top: 65px; width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Update</button>
        </div>
        </div>
    `;
    crosshairSettingsModal.innerHTML = `
    <label>CROSSHAIR</label>
    <button id="closeCrosshairSettings" style="float: right; background: transparent; border: none; color: white; cursor: pointer;">✖</button>
<div style="display: flex; flex-direction: row; gap: 15px; margin-top : 15px;">
    <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/7be1c5f3-9ad1-11ef-b170-45e28d82b1ad.gif" style="width: 115px; height: 115px;">
        <button id="option1Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/3a948891-4a8f-11ef-8140-5b4c5fd8c3dd.gif" style="width: 115px; height: 115px;">
        <button id="option5Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/354b6bd7-1cd8-11ef-8822-bbb60d940ece.gif" style="width: 115px; height: 115px;">
        <button id="option3Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/18315826-1cd8-11ef-a2e5-bbb60d940ece.gif" style="width: 115px; height: 115px;">
        <button id="option2Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
</div>
<div style="display: flex; flex-direction: row; gap: 15px; margin-top : 15px;">
  <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/1904aeee-9ad2-11ef-b197-45e28d82b1ad.gif" style="width: 115px; height: 115px;">
        <button id="option4Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
      <div style="display: flex; flex-direction: column; align-items: center; width: 385px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
         <label>CROSSHAIR SETTINGS</label>
         <label style="font-size : 12px;">CROSSHAIR SIZE</label>
         <input type="range" id="crosshairSizeSlider" min="0" max="38" value="${CrossSize}">
               <div id="sliderValue">${CrossSize}</div>
    </div>
      <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/3f1093ca-4a8d-11ef-92cc-5b4c5fd8c3dd.gif" style="width: 115px; height: 115px;">
        <button id="option6Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
 </div>
 <div style="display: flex; flex-direction: row; gap: 15px; margin-top : 15px;">
       <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/0204821c-aa6a-11ef-84c4-2725c76428b0.gif" style="width: 115px; height: 115px;">
        <button id="option7Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
           <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/42579dc0-99cd-11ef-808f-0b01a4cf3689.gif" style="width: 115px; height: 115px;">
        <button id="option8Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
               <div style="display: flex; flex-direction: column; align-items: center; width: 185px; height: 185px; background: rgb(50, 50, 50); border: 2px solid rgb(60, 60, 60); border-radius: 10px;">
        <label>CROSSHAIR</label>
        <img src="https://piskel-imgstore-b.appspot.com/img/e0a03de8-c2b3-11ef-95f7-c14fa4ed6efb.gif" style="width: 115px; height: 115px;">
        <button id="option9Button" style="width: 150px; height: 40px; background: rgb(40, 40, 40); border: none; border-radius: 10px; color: white; font-size: 18px; cursor: pointer;">Enable</button>
    </div>
    </div>
`;

    document.getElementById('option1Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/7be1c5f3-9ad1-11ef-b170-45e28d82b1ad.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option2Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/18315826-1cd8-11ef-a2e5-bbb60d940ece.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option3Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/354b6bd7-1cd8-11ef-8822-bbb60d940ece.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option4Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/1904aeee-9ad2-11ef-b197-45e28d82b1ad.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option5Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/3a948891-4a8f-11ef-8140-5b4c5fd8c3dd.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option6Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/3f1093ca-4a8d-11ef-92cc-5b4c5fd8c3dd.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option7Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/588a83cc-aa68-11ef-869b-2725c76428b0.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option8Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/e5874b87-99cc-11ef-a284-0b01a4cf3689.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('option9Button').addEventListener('click', function() {
        crosshairvalue = 'https://piskel-imgstore-b.appspot.com/img/643da997-c382-11ef-a652-398c3ca0dc0d.gif';
        GM_setValue("crosshair", crosshairvalue);
    });
    document.getElementById('crosshairSizeSlider').addEventListener('input', function() {
        CrossSize = parseInt(this.value);
        document.getElementById('sliderValue').textContent = this.value;
        GM_setValue("crosshairSize", CrossSize);
    })
    document.getElementById('colorPicker1').addEventListener('input', function() {
        colorPicker1Value = this.value;
        GM_setValue("colorPicker1", colorPicker1Value);

        document.querySelectorAll(".item").forEach(hotbar => {
            hotbar.style.backgroundColor = colorPicker1Value;
        });
    });

    document.getElementById('colorPicker2').addEventListener('input', function() {
        colorPicker2Value = this.value;
        GM_setValue("colorPicker2", colorPicker2Value);

        document.querySelectorAll(".item").forEach(hotbar => {
            hotbar.style.borderColor = colorPicker2Value;
        });
    });
    document.getElementById('UpdateButton').addEventListener('click', function() {
        window.open('https://greasyfork.org/en/scripts/489428-deep-space-client', '_blank');
    })

    let canvasWidth, canvasHeight, isResolutionVisible = false, resolutionSliderContainer;
    function init() {
        const canvas = document.getElementById('noa-canvas');
        if (canvas) {
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
            const resolutionSlider = document.getElementById('resolutionSlider');
            const resolutionValueLabel = document.getElementById('resolutionValueLabel');

            const savedResolution = GM_getValue('resolutionSliderValue', '1.0');
            resolutionSlider.value = savedResolution;
            resolutionValueLabel.textContent = `Resolution: ${(+savedResolution).toFixed(2)}x`;
            canvas.width = canvasWidth * savedResolution;
            canvas.height = canvasHeight * savedResolution;

            resolutionSlider.addEventListener('input', function () {
                const resolutionValue = (+this.value).toFixed(2);
                resolutionValueLabel.textContent = `Resolution: ${resolutionValue}x`;
                canvas.width = canvasWidth * this.value;
                canvas.height = canvasHeight * this.value;
                GM_setValue('resolutionSliderValue', this.value);
            });

            const originalRequestPointerLock = Element.prototype.requestPointerLock;
            Element.prototype.requestPointerLock = function () {
                if (!isResolutionVisible) originalRequestPointerLock.call(this);
            };
        }
    }
    const interval = setInterval(() => {
        if (document.getElementById('noa-canvas')) {
            clearInterval(interval);
            init();
        }
    }, 100);

    let boxVisible = false;
    let isSettingKey = false;
    document.addEventListener('keydown', function(event) {
        if (isSettingKey) {
            if (document.pointerLockElement) document.exitPointerLock();
            toggleKey = event.code;
            document.getElementById('customKey').value = toggleKey;
            GM_setValue('menuToggleKey', toggleKey);
            isSettingKey = false;
        } else if (event.code === toggleKey) {
            boxVisible = !boxVisible;
            mainBox.style.display = boxVisible ? 'none' : 'none';
            mainMenu.style.display = boxVisible ? 'flex' : 'none';
            settingsModal.style.display = boxVisible ? 'none' : 'none';
            crosshairSettingsModal.style.display = boxVisible ? 'none' : 'none';
            toggleshiftSettingsModal.style.display = boxVisible ? 'none' : 'none';
            resolutionSettingsModal.style.display = boxVisible ? 'none' : 'none';
            hotbarSettingsModal.style.display = boxVisible ? 'none' : 'none';
            capeModal.style.display = boxVisible ? 'none' : 'none';
            mainHud.style.backgroundColor = 'transparent';
            mainHud.style.backdropFilter = 'blur(0px)';

            if (boxVisible && document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
    });

    document.getElementById('CommitChanges').addEventListener('click', function() {
        EditHud.style.display = 'none';
        mainMenu.style.display = 'flex';
        mainBox.style.display = 'block';
        mainHud.style.backgroundColor = 'transparent';
    });
    document.getElementById('closetoggleshiftSettings').addEventListener('click', function() {
        toggleshiftSettingsModal.style.display = 'none';
    });
    const customSprintKeyInput = document.getElementById('customSprintKey');
    customSprintKeyInput.addEventListener('keydown', (e) => {
        e.preventDefault();
        togglesprintKey = e.code;
        customSprintKeyInput.value = e.code;
        GM_setValue('togglesprintKey', togglesprintKey);
    });
    document.getElementById('customSprintKey').addEventListener('click', function() {
        this.value = 'PRESS A KEY';
    });
    settingsButton.addEventListener('click', function() {
        settingsModal.style.display = 'block';
    });

    closeIcon.addEventListener('click', function() {
        mainBox.style.display = 'none';
    });
    document.getElementById('closeResolutionSettings').addEventListener('click', function() {
        resolutionSettingsModal.style.display = 'none';
    });
    document.getElementById('closeCapeSettings').addEventListener('click', function() {
        capeModal.style.display = 'none';
        mainMenu.style.display = 'flex';
        mainHud.style.backgroundColor = 'transparent';
        mainHud.style.backdropFilter = 'blur(0px)';
    });
    document.getElementById('customKey').addEventListener('click', function() {
        isSettingKey = true;
        this.value = 'PRESS A KEY';
    });
    document.getElementById('closeHotbarSettings').addEventListener('click', function() {
        hotbarSettingsModal.style.display = 'none';
    });
    document.getElementById('closeSettings').addEventListener('click', function() {
        settingsModal.style.display = 'none';
    });

    document.getElementById('closeCrosshairSettings').addEventListener('click', function() {
        crosshairSettingsModal.style.display = 'none';
    });

})();
