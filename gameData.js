// Game data with realistic Italian pricing (2024-2026 averages)
// Each item has individual price in cents
const gameData = [
    {
        id: 1,
        items: [
            { name: "PASTA BARILLA 500G", qty: 2, priceCents: 119 },
            { name: "SALSA POMODORO MUTTI 400G", qty: 1, priceCents: 189 },
            { name: "LATTE PARZ. SCREMATO 1L", qty: 1, priceCents: 125 },
            { name: "MELE GALA (1.2KG)", qty: 1, priceCents: 299 },
            { name: "BISCOTTI MULINO BIANCO", qty: 1, priceCents: 289 }
        ]
    },
    {
        id: 2,
        items: [
            { name: "CEREALI KELLOGG'S 375G", qty: 1, priceCents: 389 },
            { name: "YOGURT GRECO 150G", qty: 3, priceCents: 79 },
            { name: "BANANE (0.8KG)", qty: 1, priceCents: 160 },
            { name: "SUCCO D'ARANCIA 1L", qty: 1, priceCents: 189 }
        ]
    },
    {
        id: 3,
        items: [
            { name: "PANE INTEGRALE 400G", qty: 1, priceCents: 169 },
            { name: "PROSCIUTTO COTTO 200G", qty: 1, priceCents: 349 },
            { name: "FORMAGGIO EMMENTHAL 200G", qty: 1, priceCents: 269 },
            { name: "INSALATA MIX 150G", qty: 1, priceCents: 139 }
        ]
    },
    {
        id: 4,
        items: [
            { name: "RISO CARNAROLI 1KG", qty: 1, priceCents: 279 },
            { name: "POMODORI PELATI 400G", qty: 2, priceCents: 159 },
            { name: "OLIO EVO 500ML", qty: 1, priceCents: 649 },
            { name: "CIPOLLA BIANCA (0.5KG)", qty: 1, priceCents: 99 },
            { name: "PARMIGIANO GRATTUGIATO 100G", qty: 1, priceCents: 289 }
        ]
    },
    {
        id: 5,
        items: [
            { name: "GELATO VANIGLIA 500ML", qty: 1, priceCents: 459 },
            { name: "CAFFE ILLY CAPSULE X10", qty: 1, priceCents: 489 },
            { name: "CIOCCOLATO LINDT 100G", qty: 1, priceCents: 249 }
        ]
    },
    {
        id: 6,
        items: [
            { name: "PIZZA SURGELATA MARGHERITA", qty: 2, priceCents: 289 },
            { name: "PATATINE FRITTE 450G", qty: 1, priceCents: 189 },
            { name: "COCA COLA 1.5L", qty: 2, priceCents: 155 }
        ]
    },
    {
        id: 7,
        items: [
            { name: "DETERSIVO LAVATRICE 2L", qty: 1, priceCents: 499 },
            { name: "CARTA IGIENICA 6 ROTOLI", qty: 1, priceCents: 349 },
            { name: "SAPONE MANI 250ML", qty: 2, priceCents: 189 }
        ]
    },
    {
        id: 8,
        items: [
            { name: "TONNO RIO MARE 80G", qty: 4, priceCents: 139 },
            { name: "MAIS DOLCE 340G", qty: 2, priceCents: 119 },
            { name: "OLIVE VERDI 280G", qty: 1, priceCents: 229 }
        ]
    },
    {
        id: 9,
        items: [
            { name: "ACQUA NATURALE 1.5L", qty: 6, priceCents: 29 },
            { name: "THE LIMONE 1.5L", qty: 2, priceCents: 139 }
        ]
    },
    {
        id: 10,
        items: [
            { name: "UOVA FRESCHE 6PZ", qty: 1, priceCents: 259 },
            { name: "BURRO 250G", qty: 1, priceCents: 229 },
            { name: "FARINA 00 1KG", qty: 1, priceCents: 99 },
            { name: "ZUCCHERO 1KG", qty: 1, priceCents: 109 }
        ]
    },
    {
        id: 11,
        items: [
            { name: "SALMONE AFFUMICATO 100G", qty: 1, priceCents: 649 },
            { name: "PHILADELPHIA 200G", qty: 1, priceCents: 299 },
            { name: "BAGEL 4PZ", qty: 1, priceCents: 229 }
        ]
    },
    {
        id: 12,
        items: [
            { name: "BIRRA PERONI 33CL", qty: 6, priceCents: 99 },
            { name: "PATATINE 150G", qty: 3, priceCents: 189 },
            { name: "NOCCIOLINE SALATE 200G", qty: 1, priceCents: 249 }
        ]
    },
    {
        id: 13,
        items: [
            { name: "MOZZARELLA BUFALA 125G", qty: 2, priceCents: 239 },
            { name: "POMODORINI 500G", qty: 1, priceCents: 249 },
            { name: "BASILICO FRESCO", qty: 1, priceCents: 149 },
            { name: "OLIO EVO 250ML", qty: 1, priceCents: 389 }
        ]
    },
    {
        id: 14,
        items: [
            { name: "NUTELLA 400G", qty: 1, priceCents: 459 },
            { name: "FETTE BISCOTTATE 630G", qty: 1, priceCents: 209 },
            { name: "MARMELLATA FRAGOLE 340G", qty: 1, priceCents: 279 },
            { name: "MIELE 250G", qty: 1, priceCents: 549 }
        ]
    },
    {
        id: 15,
        items: [
            { name: "MINESTRONE SURGELATO 750G", qty: 2, priceCents: 219 },
            { name: "SPINACI SURGELATI 450G", qty: 1, priceCents: 189 },
            { name: "PISELLI SURGELATI 450G", qty: 1, priceCents: 179 }
        ]
    },
    {
        id: 16,
        items: [
            { name: "PANDORO BAULI 750G", qty: 1, priceCents: 599 },
            { name: "SPUMANTE PROSECCO 0.75L", qty: 1, priceCents: 749 }
        ]
    },
    {
        id: 17,
        items: [
            { name: "WURSTEL WUDY 250G", qty: 1, priceCents: 269 },
            { name: "SENAPE 250ML", qty: 1, priceCents: 169 },
            { name: "KETCHUP 500ML", qty: 1, priceCents: 219 },
            { name: "PANINI HOT DOG 6PZ", qty: 1, priceCents: 199 }
        ]
    },
    {
        id: 18,
        items: [
            { name: "CRACKERS RITZ 300G", qty: 2, priceCents: 189 },
            { name: "GRISSINI TORINESI 200G", qty: 1, priceCents: 149 },
            { name: "TARALLI PUGLIESI 400G", qty: 1, priceCents: 249 }
        ]
    },
    {
        id: 19,
        items: [
            { name: "POLLO INTERO 1.5KG", qty: 1, priceCents: 749 },
            { name: "PATATE (1KG)", qty: 1, priceCents: 129 },
            { name: "CAROTE (500G)", qty: 1, priceCents: 99 },
            { name: "ROSMARINO FRESCO", qty: 1, priceCents: 119 }
        ]
    },
    {
        id: 20,
        items: [
            { name: "SPAGHETTI DE CECCO 500G", qty: 3, priceCents: 149 },
            { name: "AGLIO", qty: 1, priceCents: 69 },
            { name: "PEPERONCINO", qty: 1, priceCents: 49 },
            { name: "PREZZEMOLO", qty: 1, priceCents: 99 }
        ]
    },
    {
        id: 21,
        items: [
            { name: "CAFFE LAVAZZA 250G", qty: 1, priceCents: 469 },
            { name: "ZUCCHERO 1KG", qty: 1, priceCents: 109 },
            { name: "LATTE INTERO 1L", qty: 2, priceCents: 139 }
        ]
    },
    {
        id: 22,
        items: [
            { name: "MORTADELLA BOLOGNA 200G", qty: 1, priceCents: 289 },
            { name: "SCAG LIA GRANA 200G", qty: 1, priceCents: 369 },
            { name: "OLIVE NERE 200G", qty: 1, priceCents: 199 },
            { name: "FOCACCIA 300G", qty: 1, priceCents: 259 }
        ]
    },
    {
        id: 23,
        items: [
            { name: "VINO ROSSO 0.75L", qty: 1, priceCents: 549 },
            { name: "GRISSINI STIRATI 150G", qty: 1, priceCents: 179 },
            { name: "SALAME FELINO 150G", qty: 1, priceCents: 429 }
        ]
    },
    {
        id: 24,
        items: [
            { name: "PESCE SPADA 300G", qty: 1, priceCents: 899 },
            { name: "LIMONI (3PZ)", qty: 1, priceCents: 199 },
            { name: "CAPPERI 100G", qty: 1, priceCents: 199 }
        ]
    },
    {
        id: 25,
        items: [
            { name: "RICOTTA FRESCA 250G", qty: 1, priceCents: 189 },
            { name: "PASSATA POMODORO 700G", qty: 2, priceCents: 139 },
            { name: "LASAGNE FRESCHE 250G", qty: 1, priceCents: 289 },
            { name: "BESCIAMELLA 200ML", qty: 1, priceCents: 169 }
        ]
    },
    {
        id: 26,
        items: [
            { name: "ARANCE (1.5KG)", qty: 1, priceCents: 279 },
            { name: "KIWI (6PZ)", qty: 1, priceCents: 229 },
            { name: "UVA (500G)", qty: 1, priceCents: 269 }
        ]
    },
    {
        id: 27,
        items: [
            { name: "PARMIGIANO REGGIANO 200G", qty: 1, priceCents: 549 },
            { name: "ACETO BALSAMICO 250ML", qty: 1, priceCents: 399 },
            { name: "RUCOLA 80G", qty: 1, priceCents: 149 }
        ]
    },
    {
        id: 28,
        items: [
            { name: "PANE CARASAU 250G", qty: 1, priceCents: 249 },
            { name: "PECORINO ROMANO 150G", qty: 1, priceCents: 369 },
            { name: "POMODORI SECCHI 200G", qty: 1, priceCents: 349 }
        ]
    },
    {
        id: 29,
        items: [
            { name: "FARINA INTEGRALE 1KG", qty: 1, priceCents: 149 },
            { name: "LIEVITO DI BIRRA", qty: 1, priceCents: 29 },
            { name: "SALE FINO 1KG", qty: 1, priceCents: 59 },
            { name: "OLIO SEMI 1L", qty: 1, priceCents: 289 }
        ]
    },
    {
        id: 30,
        items: [
            { name: "BRIE 200G", qty: 1, priceCents: 389 },
            { name: "NOCI 150G", qty: 1, priceCents: 349 },
            { name: "MIELE ACACIA 250G", qty: 1, priceCents: 599 },
            { name: "PERE (800G)", qty: 1, priceCents: 209 }
        ]
    }
];

// Calculate total for each receipt
gameData.forEach(receipt => {
    let total = 0;
    receipt.items.forEach(item => {
        total += item.priceCents * item.qty;
    });
    receipt.priceCents = total;
});
