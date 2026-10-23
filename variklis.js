document.addEventListener("DOMContentLoaded", () => {
    const FOTO_APLANKAS = "foto/foto";
    const POSLINKIO_RIBA = 3;
    const PASUKIMO_RIBA = 5;
    const TEMPIMO_RIBA = 4;

    const darbuParametrai = [
        { x: 17, y: 20, plotis: 0, aukstis: 55, turiApie: false },
        { x: 45, y: 83, plotis: 0, aukstis: 30 },
        { x: 64, y: 58, plotis: 20, aukstis: 0 },
        { x: 15, y: 70, plotis: 0, aukstis: 25 },
        { x: 2, y: 40, plotis: 15, aukstis: 0 },
        { x: 85, y: 10, plotis: 15, aukstis: 0 },
    ];

    const darbai = darbuParametrai.map((parametrai) => ({
        turiApie: true,
        ...parametrai,
        x: parametrai.x + atsitiktinisPokytis(POSLINKIO_RIBA),
        y: parametrai.y + atsitiktinisPokytis(POSLINKIO_RIBA),
        pasukimas: atsitiktinisPokytis(PASUKIMO_RIBA),
        elementai: [],
    }));

    const drobe = document.getElementById("drobe");
    const uzsklanda = document.getElementById("uzsklanda");
    const ekranas = { plotis: window.innerWidth, aukstis: window.innerHeight };
    const kamera = { x: 0, y: 0 };
    const pele = { tempia: false, x: 0, y: 0 };
    const palietimas = { x: 0, y: 0 };

    const drobesDalys = [];
    const apieTuriniai = new Map();

    function darboNuotraukosKelias(numeris) {
        return FOTO_APLANKAS + numeris + ".png";
    }

    function nustatytiDrobesDaliesDydi(elementas) {
        elementas.style.width = ekranas.plotis + "px";
        elementas.style.height = ekranas.aukstis + "px";
    }

    function pritaikytiPaveikslelioNustatymus(darbas, elementas) {
        elementas.style.left = darbas.x + "%";
        elementas.style.top = darbas.y + "%";
        elementas.style.transform = `rotate(${darbas.pasukimas}deg)`;

        if (darbas.plotis > 0) {
            elementas.style.width = darbas.plotis + "%";
            elementas.style.height = "auto";
        } else if (darbas.aukstis > 0) {
            elementas.style.height = darbas.aukstis + "%";
            elementas.style.width = "auto";
        }
    }

    function atnaujintiDarba(darbas) {
        for (const elementas of darbas.elementai) {
            pritaikytiPaveikslelioNustatymus(darbas, elementas);
        }
    }

    function sukurtiDarba(numeris, dalisX, dalisY) {
        const darbas = darbai[numeris - 1];
        const elementas = document.createElement("img");

        elementas.className = "judinamas";
        elementas.id = `darbas-${numeris}-${dalisX}-${dalisY}`;
        elementas.src = darboNuotraukosKelias(numeris);
        elementas.style.zIndex = Math.random() * 10 + 1;

        darbas.elementai.push(elementas);
        pritaikytiPaveikslelioNustatymus(darbas, elementas);

        elementas.addEventListener("dragstart", (e) => e.preventDefault());
        elementas.addEventListener("mousedown", (e) => {
            elementas.style.cursor = "grabbing";
            pradetiDarboTempima(darbas, e.clientX, e.clientY);
        });
        elementas.addEventListener("touchstart", (e) => {
            const taskas = e.touches[0];
            pradetiDarboTempima(darbas, taskas.clientX, taskas.clientY);
        });

        if (darbas.turiApie) {
            elementas.addEventListener("click", (e) => {
                e.stopPropagation();
                if (darboTempimas.pajudejo) {
                    return;
                }
                atidarytiApie(numeris);
            });
        }

        return elementas;
    }

    function sukurtiPaveiksloDali(dalisX, dalisY) {
        const elementas = document.createElement("div");

        elementas.className = "paveikslo-dalis";
        elementas.style.position = "absolute";
        elementas.style.pointerEvents = "none";
        nustatytiDrobesDaliesDydi(elementas);

        for (let numeris = 1; numeris <= darbai.length; numeris++) {
            elementas.appendChild(sukurtiDarba(numeris, dalisX, dalisY));
        }

        drobe.appendChild(elementas);
        return { elementas, x: dalisX, y: dalisY };
    }

    function sukurtiPaveikslus() {
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                drobesDalys.push(sukurtiPaveiksloDali(x, y));
            }
        }
    }

    function sukurtiApieTurini(numeris) {
        const turinys = document.createElement("div");
        const nuotrauka = document.createElement("img");
        const apieNuotrauka = document.createElement("img");

        turinys.className = "apie-darba-turinys";
        turinys.id = "apie-" + numeris;
        nuotrauka.src = darboNuotraukosKelias(numeris);
        nuotrauka.className = "darbo_foto";
        apieNuotrauka.src = "foto/prirasai8.png";
        apieNuotrauka.className = "prirasai8";

        turinys.appendChild(nuotrauka);
        turinys.appendChild(apieNuotrauka)
        turinys.addEventListener("click", (e) => e.stopPropagation());
        uzsklanda.appendChild(turinys);

        return turinys;
    }

    function sukurtiApieTurinius() {
        darbai.forEach((darbas, indeksas) => {
            if (darbas.turiApie) {
                apieTuriniai.set(indeksas + 1, sukurtiApieTurini(indeksas + 1));
            }
        });
    }

    function apgautiKamera() {
        if (kamera.x > ekranas.plotis) kamera.x -= ekranas.plotis;
        if (kamera.x < -ekranas.plotis) kamera.x += ekranas.plotis;
        if (kamera.y > ekranas.aukstis) kamera.y -= ekranas.aukstis;
        if (kamera.y < -ekranas.aukstis) kamera.y += ekranas.aukstis;
    }

    function atnaujintiVaizda() {
        for (const dalis of drobesDalys) {
            const poslinkisX = dalis.x * ekranas.plotis + kamera.x;
            const poslinkisY = dalis.y * ekranas.aukstis + kamera.y;
            dalis.elementas.style.transform = `translate(${poslinkisX}px, ${poslinkisY}px)`;
        }
    }

    function perkeltiKamera(poslinkisX, poslinkisY) {
        kamera.x += poslinkisX;
        kamera.y += poslinkisY;
        apgautiKamera();
        atnaujintiVaizda();
    }
    
    const darboTempimas = { darbas: null, x: 0, y: 0, nueita: 0, pajudejo: false };

    function pradetiDarboTempima(darbas, x, y) {
        darboTempimas.darbas = darbas;
        darboTempimas.x = x;
        darboTempimas.y = y;
        darboTempimas.nueita = 0;
        darboTempimas.pajudejo = false;
    }

    function apgautiProcentus(reiksme) {
        return ((reiksme % 100) + 100) % 100;
    }

    function temptiDarba(x, y) {
        const darbas = darboTempimas.darbas;
        if (!darbas) {
            return;
        }
        const poslinkisX = x - darboTempimas.x;
        const poslinkisY = y - darboTempimas.y;
        darboTempimas.x = x;
        darboTempimas.y = y;

        darboTempimas.nueita += Math.abs(poslinkisX) + Math.abs(poslinkisY);
        if (darboTempimas.nueita > TEMPIMO_RIBA) {
            darboTempimas.pajudejo = true;
        }

        darbas.x = apgautiProcentus(darbas.x + (poslinkisX / ekranas.plotis) * 100);
        darbas.y = apgautiProcentus(darbas.y + (poslinkisY / ekranas.aukstis) * 100);
        atnaujintiDarba(darbas);
    }

    function baigtiDarboTempima() {
        darboTempimas.darbas = null;
    }

    function pradetiTempima(e) {
        if (e.target.tagName === "IMG") {
            return;
        }
        pele.tempia = true;
        pele.x = e.clientX;
        pele.y = e.clientY;
        drobe.style.cursor = "grabbing";
    }

    function tempti(e) {
        if (!pele.tempia) {
            return;
        }
        const poslinkisX = e.clientX - pele.x;
        const poslinkisY = e.clientY - pele.y;
        pele.x = e.clientX;
        pele.y = e.clientY;
        perkeltiKamera(poslinkisX, poslinkisY);
    }

    function baigtiTempima() {
        pele.tempia = false;
        drobe.style.cursor = "default";
    }

    function ratukoJudesys(e) {
        e.preventDefault();
        perkeltiKamera(-e.deltaX, -e.deltaY);
    }

    function pradetiPalietima(e) {
        if (e.target.tagName === "IMG") {
            return;
        }
        const taskas = e.touches[0];
        palietimas.x = taskas.clientX;
        palietimas.y = taskas.clientY;
    }

    function judintiPalietima(e) {
        const taskas = e.touches[0];
        if (darboTempimas.darbas) {
            e.preventDefault();
            temptiDarba(taskas.clientX, taskas.clientY);
            return;
        }
        if (e.target.tagName === "IMG") {
            return;
        }
        e.preventDefault();
        const poslinkisX = taskas.clientX - palietimas.x;
        const poslinkisY = taskas.clientY - palietimas.y;
        palietimas.x = taskas.clientX;
        palietimas.y = taskas.clientY;
        perkeltiKamera(poslinkisX, poslinkisY);
    }

    function atidarytiApie(numeris) {
        const turinys = apieTuriniai.get(numeris);

        if (turinys.style.display === "flex") {
            return;
        }
        uzsklanda.style.display = "flex";
        turinys.style.display = "flex";
    }

    function uzdarytiApie() {
        uzsklanda.style.display = "none";
        for (const turinys of apieTuriniai.values()) {
            turinys.style.display = "none";
        }
    }

    function pakeistiEkranoDydi() {
        ekranas.plotis = window.innerWidth;
        ekranas.aukstis = window.innerHeight;

        for (const dalis of drobesDalys) {
            nustatytiDrobesDaliesDydi(dalis.elementas);
        }
        atnaujintiVaizda();
    }

    sukurtiPaveikslus();
    sukurtiApieTurinius();
    atnaujintiVaizda();

    drobe.addEventListener("mousedown", pradetiTempima);
    document.addEventListener("mousemove", tempti);
    document.addEventListener("mouseup", baigtiTempima);
    document.addEventListener("mousemove", (e) => temptiDarba(e.clientX, e.clientY));
    document.addEventListener("mouseup", baigtiDarboTempima);
    drobe.addEventListener("touchend", baigtiDarboTempima);
    drobe.addEventListener("wheel", ratukoJudesys, { passive: false });
    drobe.addEventListener("touchstart", pradetiPalietima);
    drobe.addEventListener("touchmove", judintiPalietima, { passive: false });
    uzsklanda.addEventListener("click", uzdarytiApie);
    window.addEventListener("resize", pakeistiEkranoDydi);
});

function atsitiktinisPokytis(riba) {
    return (Math.random() * 2 - 1) * riba;
}