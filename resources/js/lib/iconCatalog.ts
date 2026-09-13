// Auto-generated curated icon catalog for StudioSync Visual Editor
export interface IconItem {
    id: string;
    name: string;
    category: 'arrows' | 'interface' | 'communication' | 'business' | 'media' | 'badges' | 'tech';
    tags: string[];
    paths: string;
}

export const ICON_CATEGORIES = [
    { id: 'all', label: 'All Icons' },
    { id: 'arrows', label: 'Arrows & Nav' },
    { id: 'interface', label: 'Interface & UI' },
    { id: 'communication', label: 'Communication' },
    { id: 'business', label: 'Business & Store' },
    { id: 'media', label: 'Media & Devices' },
    { id: 'badges', label: 'Badges & Status' },
    { id: 'tech', label: 'Tech & Data' },
] as const;

export type IconCategory = typeof ICON_CATEGORIES[number]['id'];

export const ICON_CATALOG: IconItem[] = [
    {
        "id": "arrow-right",
        "name": "Arrow Right",
        "category": "arrows",
        "tags": [
            "next",
            "forward",
            "pointer",
            "go"
        ],
        "paths": "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>"
    },
    {
        "id": "arrow-left",
        "name": "Arrow Left",
        "category": "arrows",
        "tags": [
            "back",
            "previous",
            "return"
        ],
        "paths": "<path d=\"m12 19-7-7 7-7\"></path><path d=\"M19 12H5\"></path>"
    },
    {
        "id": "arrow-up",
        "name": "Arrow Up",
        "category": "arrows",
        "tags": [
            "top",
            "upward"
        ],
        "paths": "<path d=\"m5 12 7-7 7 7\"></path><path d=\"M12 19V5\"></path>"
    },
    {
        "id": "arrow-down",
        "name": "Arrow Down",
        "category": "arrows",
        "tags": [
            "bottom",
            "downward",
            "download"
        ],
        "paths": "<path d=\"M12 5v14\"></path><path d=\"m19 12-7 7-7-7\"></path>"
    },
    {
        "id": "arrow-up-right",
        "name": "Arrow Up Right",
        "category": "arrows",
        "tags": [
            "external",
            "link",
            "out",
            "diagonal"
        ],
        "paths": "<path d=\"M7 7h10v10\"></path><path d=\"M7 17 17 7\"></path>"
    },
    {
        "id": "arrow-down-right",
        "name": "Arrow Down Right",
        "category": "arrows",
        "tags": [
            "diagonal",
            "down"
        ],
        "paths": "<path d=\"m7 7 10 10\"></path><path d=\"M17 7v10H7\"></path>"
    },
    {
        "id": "chevron-right",
        "name": "Chevron Right",
        "category": "arrows",
        "tags": [
            "arrow",
            "next",
            "caret"
        ],
        "paths": "<path d=\"m9 18 6-6-6-6\"></path>"
    },
    {
        "id": "chevron-left",
        "name": "Chevron Left",
        "category": "arrows",
        "tags": [
            "arrow",
            "back",
            "caret"
        ],
        "paths": "<path d=\"m15 18-6-6 6-6\"></path>"
    },
    {
        "id": "chevron-up",
        "name": "Chevron Up",
        "category": "arrows",
        "tags": [
            "arrow",
            "up",
            "collapse"
        ],
        "paths": "<path d=\"m18 15-6-6-6 6\"></path>"
    },
    {
        "id": "chevron-down",
        "name": "Chevron Down",
        "category": "arrows",
        "tags": [
            "arrow",
            "down",
            "expand"
        ],
        "paths": "<path d=\"m6 9 6 6 6-6\"></path>"
    },
    {
        "id": "move-right",
        "name": "Move Right",
        "category": "arrows",
        "tags": [
            "arrow",
            "drag",
            "next"
        ],
        "paths": "<path d=\"M18 8L22 12L18 16\"></path><path d=\"M2 12H22\"></path>"
    },
    {
        "id": "external-link",
        "name": "External Link",
        "category": "arrows",
        "tags": [
            "open",
            "new tab",
            "url",
            "out"
        ],
        "paths": "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>"
    },
    {
        "id": "compass",
        "name": "Compass",
        "category": "arrows",
        "tags": [
            "navigation",
            "direction",
            "explore",
            "travel"
        ],
        "paths": "<path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"></path><circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"
    },
    {
        "id": "map-pin",
        "name": "Map Pin",
        "category": "arrows",
        "tags": [
            "location",
            "marker",
            "address",
            "place"
        ],
        "paths": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>"
    },
    {
        "id": "navigation",
        "name": "Navigation",
        "category": "arrows",
        "tags": [
            "gps",
            "travel",
            "pointer",
            "direct"
        ],
        "paths": "<polygon points=\"3 11 22 2 13 21 11 13 3 11\"></polygon>"
    },
    {
        "id": "menu",
        "name": "Menu",
        "category": "arrows",
        "tags": [
            "hamburger",
            "nav",
            "list",
            "drawer"
        ],
        "paths": "<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\"></line><line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\"></line><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\"></line>"
    },
    {
        "id": "plus",
        "name": "Plus",
        "category": "interface",
        "tags": [
            "add",
            "create",
            "new"
        ],
        "paths": "<path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path>"
    },
    {
        "id": "minus",
        "name": "Minus",
        "category": "interface",
        "tags": [
            "remove",
            "subtract",
            "delete"
        ],
        "paths": "<path d=\"M5 12h14\"></path>"
    },
    {
        "id": "check",
        "name": "Check",
        "category": "interface",
        "tags": [
            "done",
            "complete",
            "success",
            "yes"
        ],
        "paths": "<path d=\"M20 6 9 17l-5-5\"></path>"
    },
    {
        "id": "circle-check",
        "name": "Check Circle",
        "category": "interface",
        "tags": [
            "done",
            "success",
            "verified"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>"
    },
    {
        "id": "x",
        "name": "Close / Cross",
        "category": "interface",
        "tags": [
            "cancel",
            "remove",
            "delete",
            "exit"
        ],
        "paths": "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>"
    },
    {
        "id": "circle-x",
        "name": "X Circle",
        "category": "interface",
        "tags": [
            "error",
            "cancel",
            "remove"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m15 9-6 6\"></path><path d=\"m9 9 6 6\"></path>"
    },
    {
        "id": "search",
        "name": "Search",
        "category": "interface",
        "tags": [
            "find",
            "lookup",
            "magnifier",
            "explore"
        ],
        "paths": "<circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.3-4.3\"></path>"
    },
    {
        "id": "filter",
        "name": "Filter",
        "category": "interface",
        "tags": [
            "sort",
            "refine",
            "funnel"
        ],
        "paths": "<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"></polygon>"
    },
    {
        "id": "refresh-cw",
        "name": "Refresh",
        "category": "interface",
        "tags": [
            "reload",
            "sync",
            "update",
            "cw"
        ],
        "paths": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"></path><path d=\"M21 3v5h-5\"></path><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"></path><path d=\"M8 16H3v5\"></path>"
    },
    {
        "id": "rotate-ccw",
        "name": "Rotate / Undo",
        "category": "interface",
        "tags": [
            "revert",
            "reset",
            "back"
        ],
        "paths": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path><path d=\"M3 3v5h5\"></path>"
    },
    {
        "id": "sliders-horizontal",
        "name": "Sliders / Adjust",
        "category": "interface",
        "tags": [
            "controls",
            "settings",
            "options",
            "filters"
        ],
        "paths": "<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\"></line><line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\"></line><line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\"></line><line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\"></line><line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\"></line><line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\"></line><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\"></line><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\"></line><line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\"></line>"
    },
    {
        "id": "settings",
        "name": "Settings",
        "category": "interface",
        "tags": [
            "gear",
            "options",
            "config",
            "preferences"
        ],
        "paths": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>"
    },
    {
        "id": "ellipsis",
        "name": "More Horizontal",
        "category": "interface",
        "tags": [
            "dots",
            "menu",
            "options"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle><circle cx=\"5\" cy=\"12\" r=\"1\"></circle>"
    },
    {
        "id": "download",
        "name": "Download",
        "category": "interface",
        "tags": [
            "save",
            "export",
            "file"
        ],
        "paths": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"7 10 12 15 17 10\"></polyline><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"></line>"
    },
    {
        "id": "upload",
        "name": "Upload",
        "category": "interface",
        "tags": [
            "import",
            "file",
            "load"
        ],
        "paths": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"17 8 12 3 7 8\"></polyline><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\"></line>"
    },
    {
        "id": "share-2",
        "name": "Share",
        "category": "interface",
        "tags": [
            "send",
            "social",
            "export"
        ],
        "paths": "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"></line><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"></line>"
    },
    {
        "id": "copy",
        "name": "Copy",
        "category": "interface",
        "tags": [
            "duplicate",
            "clipboard",
            "clone"
        ],
        "paths": "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path>"
    },
    {
        "id": "trash-2",
        "name": "Trash / Delete",
        "category": "interface",
        "tags": [
            "remove",
            "bin",
            "destroy"
        ],
        "paths": "<path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"></line><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"></line>"
    },
    {
        "id": "pencil",
        "name": "Pencil / Edit",
        "category": "interface",
        "tags": [
            "write",
            "modify",
            "compose"
        ],
        "paths": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path><path d=\"m15 5 4 4\"></path>"
    },
    {
        "id": "eye",
        "name": "Eye / View",
        "category": "interface",
        "tags": [
            "show",
            "visible",
            "preview"
        ],
        "paths": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>"
    },
    {
        "id": "eye-off",
        "name": "Eye Off",
        "category": "interface",
        "tags": [
            "hide",
            "hidden",
            "invisible"
        ],
        "paths": "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"></path><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"></path><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"></path><path d=\"m2 2 20 20\"></path>"
    },
    {
        "id": "mail",
        "name": "Mail / Email",
        "category": "communication",
        "tags": [
            "envelope",
            "contact",
            "letter",
            "message"
        ],
        "paths": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"></rect><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"></path>"
    },
    {
        "id": "phone",
        "name": "Phone",
        "category": "communication",
        "tags": [
            "call",
            "contact",
            "telephone",
            "mobile"
        ],
        "paths": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>"
    },
    {
        "id": "phone-call",
        "name": "Phone Call",
        "category": "communication",
        "tags": [
            "call",
            "contact",
            "answer"
        ],
        "paths": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path><path d=\"M14.05 2a9 9 0 0 1 8 7.94\"></path><path d=\"M14.05 6A5 5 0 0 1 18 10\"></path>"
    },
    {
        "id": "message-square",
        "name": "Message Square",
        "category": "communication",
        "tags": [
            "chat",
            "comment",
            "dialogue",
            "bubble"
        ],
        "paths": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path>"
    },
    {
        "id": "message-circle",
        "name": "Message Circle",
        "category": "communication",
        "tags": [
            "chat",
            "talk",
            "conversation"
        ],
        "paths": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"></path>"
    },
    {
        "id": "send",
        "name": "Send",
        "category": "communication",
        "tags": [
            "submit",
            "paper plane",
            "message",
            "share"
        ],
        "paths": "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"></path><path d=\"m21.854 2.147-10.94 10.939\"></path>"
    },
    {
        "id": "bell",
        "name": "Bell / Notification",
        "category": "communication",
        "tags": [
            "alert",
            "alarm",
            "ring"
        ],
        "paths": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"></path><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"></path>"
    },
    {
        "id": "globe",
        "name": "Globe / Web",
        "category": "communication",
        "tags": [
            "internet",
            "world",
            "language",
            "earth"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"></path><path d=\"M2 12h20\"></path>"
    },
    {
        "id": "at-sign",
        "name": "At Sign",
        "category": "communication",
        "tags": [
            "email",
            "mention",
            "user"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"></path>"
    },
    {
        "id": "credit-card",
        "name": "Credit Card",
        "category": "business",
        "tags": [
            "payment",
            "checkout",
            "buy",
            "purchase"
        ],
        "paths": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"></rect><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"></line>"
    },
    {
        "id": "shopping-cart",
        "name": "Shopping Cart",
        "category": "business",
        "tags": [
            "buy",
            "store",
            "ecommerce",
            "checkout"
        ],
        "paths": "<circle cx=\"8\" cy=\"21\" r=\"1\"></circle><circle cx=\"19\" cy=\"21\" r=\"1\"></circle><path d=\"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12\"></path>"
    },
    {
        "id": "shopping-bag",
        "name": "Shopping Bag",
        "category": "business",
        "tags": [
            "shop",
            "store",
            "merch",
            "retail"
        ],
        "paths": "<path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"></path><path d=\"M3 6h18\"></path><path d=\"M16 10a4 4 0 0 1-8 0\"></path>"
    },
    {
        "id": "dollar-sign",
        "name": "Dollar Sign",
        "category": "business",
        "tags": [
            "money",
            "price",
            "pricing",
            "currency",
            "cash"
        ],
        "paths": "<line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"></line><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"></path>"
    },
    {
        "id": "wallet",
        "name": "Wallet",
        "category": "business",
        "tags": [
            "finance",
            "money",
            "crypto",
            "pay"
        ],
        "paths": "<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"></path><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\"></path>"
    },
    {
        "id": "percent",
        "name": "Percent / Discount",
        "category": "business",
        "tags": [
            "sale",
            "offer",
            "deal",
            "promo"
        ],
        "paths": "<line x1=\"19\" x2=\"5\" y1=\"5\" y2=\"19\"></line><circle cx=\"6.5\" cy=\"6.5\" r=\"2.5\"></circle><circle cx=\"17.5\" cy=\"17.5\" r=\"2.5\"></circle>"
    },
    {
        "id": "tag",
        "name": "Tag / Label",
        "category": "business",
        "tags": [
            "badge",
            "category",
            "price",
            "label"
        ],
        "paths": "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"></path><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"></circle>"
    },
    {
        "id": "award",
        "name": "Award / Trophy",
        "category": "business",
        "tags": [
            "prize",
            "winner",
            "badge",
            "certificate",
            "medal"
        ],
        "paths": "<path d=\"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526\"></path><circle cx=\"12\" cy=\"8\" r=\"6\"></circle>"
    },
    {
        "id": "trending-up",
        "name": "Trending Up",
        "category": "business",
        "tags": [
            "growth",
            "analytics",
            "profit",
            "rise"
        ],
        "paths": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"></polyline><polyline points=\"16 7 22 7 22 13\"></polyline>"
    },
    {
        "id": "chart-bar",
        "name": "Bar Chart",
        "category": "business",
        "tags": [
            "analytics",
            "stats",
            "data",
            "metrics"
        ],
        "paths": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"></path><path d=\"M7 16h8\"></path><path d=\"M7 11h12\"></path><path d=\"M7 6h3\"></path>"
    },
    {
        "id": "briefcase",
        "name": "Briefcase",
        "category": "business",
        "tags": [
            "work",
            "job",
            "portfolio",
            "business"
        ],
        "paths": "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"></path><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\"></rect>"
    },
    {
        "id": "building-2",
        "name": "Building",
        "category": "business",
        "tags": [
            "office",
            "company",
            "agency",
            "studio"
        ],
        "paths": "<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"></path><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"></path><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"></path><path d=\"M10 6h4\"></path><path d=\"M10 10h4\"></path><path d=\"M10 14h4\"></path><path d=\"M10 18h4\"></path>"
    },
    {
        "id": "store",
        "name": "Storefront",
        "category": "business",
        "tags": [
            "shop",
            "market",
            "boutique",
            "retail"
        ],
        "paths": "<path d=\"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7\"></path><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"></path><path d=\"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4\"></path><path d=\"M2 7h20\"></path><path d=\"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7\"></path>"
    },
    {
        "id": "gem",
        "name": "Gem / Diamond",
        "category": "business",
        "tags": [
            "luxury",
            "premium",
            "vip",
            "quality"
        ],
        "paths": "<path d=\"M6 3h12l4 6-10 13L2 9Z\"></path><path d=\"M11 3 8 9l4 13 4-13-3-6\"></path><path d=\"M2 9h20\"></path>"
    },
    {
        "id": "crown",
        "name": "Crown",
        "category": "business",
        "tags": [
            "king",
            "vip",
            "pro",
            "premium",
            "best"
        ],
        "paths": "<path d=\"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z\"></path><path d=\"M5 21h14\"></path>"
    },
    {
        "id": "camera",
        "name": "Camera",
        "category": "media",
        "tags": [
            "photo",
            "photography",
            "shoot",
            "picture"
        ],
        "paths": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>"
    },
    {
        "id": "image",
        "name": "Image",
        "category": "media",
        "tags": [
            "picture",
            "gallery",
            "photo",
            "artwork"
        ],
        "paths": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"></rect><circle cx=\"9\" cy=\"9\" r=\"2\"></circle><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path>"
    },
    {
        "id": "video",
        "name": "Video",
        "category": "media",
        "tags": [
            "movie",
            "camera",
            "record",
            "film"
        ],
        "paths": "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"></path><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect>"
    },
    {
        "id": "play",
        "name": "Play",
        "category": "media",
        "tags": [
            "start",
            "video",
            "media",
            "stream"
        ],
        "paths": "<polygon points=\"6 3 20 12 6 21 6 3\"></polygon>"
    },
    {
        "id": "pause",
        "name": "Pause",
        "category": "media",
        "tags": [
            "stop",
            "hold",
            "media"
        ],
        "paths": "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"></rect><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"></rect>"
    },
    {
        "id": "music",
        "name": "Music",
        "category": "media",
        "tags": [
            "audio",
            "song",
            "sound",
            "tune"
        ],
        "paths": "<path d=\"M9 18V5l12-2v13\"></path><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><circle cx=\"18\" cy=\"16\" r=\"3\"></circle>"
    },
    {
        "id": "mic",
        "name": "Microphone",
        "category": "media",
        "tags": [
            "audio",
            "record",
            "voice",
            "podcast"
        ],
        "paths": "<path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"></path><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"></path><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"></line>"
    },
    {
        "id": "monitor",
        "name": "Monitor / Screen",
        "category": "media",
        "tags": [
            "desktop",
            "display",
            "computer"
        ],
        "paths": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"></rect><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"></line><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"></line>"
    },
    {
        "id": "smartphone",
        "name": "Smartphone",
        "category": "media",
        "tags": [
            "mobile",
            "phone",
            "device",
            "app"
        ],
        "paths": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"></rect><path d=\"M12 18h.01\"></path>"
    },
    {
        "id": "laptop",
        "name": "Laptop",
        "category": "media",
        "tags": [
            "macbook",
            "computer",
            "device",
            "workstation"
        ],
        "paths": "<path d=\"M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16\"></path>"
    },
    {
        "id": "headphones",
        "name": "Headphones",
        "category": "media",
        "tags": [
            "audio",
            "listen",
            "sound",
            "music"
        ],
        "paths": "<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\"></path>"
    },
    {
        "id": "sparkles",
        "name": "Sparkles",
        "category": "badges",
        "tags": [
            "magic",
            "ai",
            "clean",
            "new",
            "featured",
            "star"
        ],
        "paths": "<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"></path><path d=\"M20 3v4\"></path><path d=\"M22 5h-4\"></path><path d=\"M4 17v2\"></path><path d=\"M5 18H3\"></path>"
    },
    {
        "id": "star",
        "name": "Star",
        "category": "badges",
        "tags": [
            "rating",
            "favorite",
            "best",
            "review",
            "feature"
        ],
        "paths": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"></path>"
    },
    {
        "id": "heart",
        "name": "Heart",
        "category": "badges",
        "tags": [
            "love",
            "like",
            "health",
            "favorite"
        ],
        "paths": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"></path>"
    },
    {
        "id": "flame",
        "name": "Flame / Fire",
        "category": "badges",
        "tags": [
            "hot",
            "popular",
            "trending",
            "deal"
        ],
        "paths": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"></path>"
    },
    {
        "id": "zap",
        "name": "Zap / Lightning",
        "category": "badges",
        "tags": [
            "fast",
            "speed",
            "energy",
            "power",
            "electric"
        ],
        "paths": "<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\"></path>"
    },
    {
        "id": "shield",
        "name": "Shield",
        "category": "badges",
        "tags": [
            "security",
            "protect",
            "safe",
            "trust"
        ],
        "paths": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path>"
    },
    {
        "id": "shield-check",
        "name": "Shield Check",
        "category": "badges",
        "tags": [
            "verified",
            "guarantee",
            "secure",
            "safety"
        ],
        "paths": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"m9 12 2 2 4-4\"></path>"
    },
    {
        "id": "lock",
        "name": "Lock",
        "category": "badges",
        "tags": [
            "privacy",
            "secure",
            "protected",
            "password"
        ],
        "paths": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>"
    },
    {
        "id": "lock-open",
        "name": "Unlock",
        "category": "badges",
        "tags": [
            "open",
            "free",
            "accessible"
        ],
        "paths": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 9.9-1\"></path>"
    },
    {
        "id": "circle-alert",
        "name": "Alert Circle",
        "category": "badges",
        "tags": [
            "warning",
            "notice",
            "attention",
            "info"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>"
    },
    {
        "id": "info",
        "name": "Info",
        "category": "badges",
        "tags": [
            "about",
            "help",
            "details",
            "hint"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>"
    },
    {
        "id": "circle-help",
        "name": "Help Circle",
        "category": "badges",
        "tags": [
            "faq",
            "question",
            "support"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><path d=\"M12 17h.01\"></path>"
    },
    {
        "id": "lightbulb",
        "name": "Lightbulb",
        "category": "badges",
        "tags": [
            "idea",
            "tip",
            "solution",
            "creative"
        ],
        "paths": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"></path><path d=\"M9 18h6\"></path><path d=\"M10 22h4\"></path>"
    },
    {
        "id": "clock",
        "name": "Clock",
        "category": "badges",
        "tags": [
            "time",
            "schedule",
            "hours",
            "duration"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline>"
    },
    {
        "id": "calendar",
        "name": "Calendar",
        "category": "badges",
        "tags": [
            "date",
            "event",
            "booking",
            "schedule"
        ],
        "paths": "<path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"></rect><path d=\"M3 10h18\"></path>"
    },
    {
        "id": "bookmark",
        "name": "Bookmark",
        "category": "badges",
        "tags": [
            "save",
            "favorite",
            "mark"
        ],
        "paths": "<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\"></path>"
    },
    {
        "id": "thumbs-up",
        "name": "Thumbs Up",
        "category": "badges",
        "tags": [
            "like",
            "approve",
            "recommend",
            "great"
        ],
        "paths": "<path d=\"M7 10v12\"></path><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\"></path>"
    },
    {
        "id": "smile",
        "name": "Smile",
        "category": "badges",
        "tags": [
            "happy",
            "face",
            "satisfaction",
            "joy"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"></path><line x1=\"9\" x2=\"9.01\" y1=\"9\" y2=\"9\"></line><line x1=\"15\" x2=\"15.01\" y1=\"9\" y2=\"9\"></line>"
    },
    {
        "id": "sun",
        "name": "Sun",
        "category": "badges",
        "tags": [
            "light",
            "day",
            "weather",
            "warm"
        ],
        "paths": "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"m4.93 4.93 1.41 1.41\"></path><path d=\"m17.66 17.66 1.41 1.41\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"m6.34 17.66-1.41 1.41\"></path><path d=\"m19.07 4.93-1.41 1.41\"></path>"
    },
    {
        "id": "moon",
        "name": "Moon",
        "category": "badges",
        "tags": [
            "dark",
            "night",
            "theme"
        ],
        "paths": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"></path>"
    },
    {
        "id": "code-xml",
        "name": "Code",
        "category": "tech",
        "tags": [
            "developer",
            "html",
            "programming",
            "software"
        ],
        "paths": "<path d=\"m18 16 4-4-4-4\"></path><path d=\"m6 8-4 4 4 4\"></path><path d=\"m14.5 4-5 16\"></path>"
    },
    {
        "id": "terminal",
        "name": "Terminal",
        "category": "tech",
        "tags": [
            "console",
            "command",
            "cli",
            "code"
        ],
        "paths": "<polyline points=\"4 17 10 11 4 5\"></polyline><line x1=\"12\" x2=\"20\" y1=\"19\" y2=\"19\"></line>"
    },
    {
        "id": "cpu",
        "name": "CPU / Processor",
        "category": "tech",
        "tags": [
            "hardware",
            "chip",
            "tech",
            "performance"
        ],
        "paths": "<rect width=\"16\" height=\"16\" x=\"4\" y=\"4\" rx=\"2\"></rect><rect width=\"6\" height=\"6\" x=\"9\" y=\"9\" rx=\"1\"></rect><path d=\"M15 2v2\"></path><path d=\"M15 20v2\"></path><path d=\"M2 15h2\"></path><path d=\"M2 9h2\"></path><path d=\"M20 15h2\"></path><path d=\"M20 9h2\"></path><path d=\"M9 2v2\"></path><path d=\"M9 20v2\"></path>"
    },
    {
        "id": "database",
        "name": "Database",
        "category": "tech",
        "tags": [
            "storage",
            "sql",
            "server",
            "data"
        ],
        "paths": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"></ellipse><path d=\"M3 5V19A9 3 0 0 0 21 19V5\"></path><path d=\"M3 12A9 3 0 0 0 21 12\"></path>"
    },
    {
        "id": "server",
        "name": "Server",
        "category": "tech",
        "tags": [
            "hosting",
            "backend",
            "cloud"
        ],
        "paths": "<rect width=\"20\" height=\"8\" x=\"2\" y=\"2\" rx=\"2\" ry=\"2\"></rect><rect width=\"20\" height=\"8\" x=\"2\" y=\"14\" rx=\"2\" ry=\"2\"></rect><line x1=\"6\" x2=\"6.01\" y1=\"6\" y2=\"6\"></line><line x1=\"6\" x2=\"6.01\" y1=\"18\" y2=\"18\"></line>"
    },
    {
        "id": "file-text",
        "name": "File Text",
        "category": "tech",
        "tags": [
            "document",
            "article",
            "note",
            "page"
        ],
        "paths": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>"
    },
    {
        "id": "folder",
        "name": "Folder",
        "category": "tech",
        "tags": [
            "directory",
            "files",
            "collection"
        ],
        "paths": "<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path>"
    },
    {
        "id": "book-open",
        "name": "Book Open",
        "category": "tech",
        "tags": [
            "read",
            "learn",
            "knowledge",
            "guide",
            "docs"
        ],
        "paths": "<path d=\"M12 7v14\"></path><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"></path>"
    },
    {
        "id": "layers",
        "name": "Layers",
        "category": "tech",
        "tags": [
            "stack",
            "design",
            "components",
            "levels"
        ],
        "paths": "<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\"></path><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\"></path><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\"></path>"
    },
    {
        "id": "box",
        "name": "Box",
        "category": "tech",
        "tags": [
            "container",
            "cube",
            "package",
            "product"
        ],
        "paths": "<path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\"></path><path d=\"m3.3 7 8.7 5 8.7-5\"></path><path d=\"M12 22V12\"></path>"
    },
    {
        "id": "package",
        "name": "Package",
        "category": "tech",
        "tags": [
            "delivery",
            "shipping",
            "box",
            "order"
        ],
        "paths": "<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\"></path><path d=\"M12 22V12\"></path><polyline points=\"3.29 7 12 12 20.71 7\"></polyline><path d=\"m7.5 4.27 9 5.15\"></path>"
    },
    {
        "id": "user",
        "name": "User / Profile",
        "category": "tech",
        "tags": [
            "person",
            "account",
            "member",
            "avatar"
        ],
        "paths": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>"
    },
    {
        "id": "users",
        "name": "Users / Team",
        "category": "tech",
        "tags": [
            "group",
            "community",
            "people",
            "collaborate"
        ],
        "paths": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>"
    },
    {
        "id": "user-check",
        "name": "User Check",
        "category": "tech",
        "tags": [
            "verified",
            "authorized",
            "member"
        ],
        "paths": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><polyline points=\"16 11 18 13 22 9\"></polyline>"
    }
];

export interface GenerateIconOptions {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    color?: string;
    strokeWidth?: number;
}

export const ICON_SIZES = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
} as const;

/**
 * Generate a standalone, standards-compliant SVG markup string matching the site theme and typography
 */
export function generateIconSvg(paths: string, options: GenerateIconOptions = {}): string {
    const size = options.size || 'md';
    const sizeClass = ICON_SIZES[size] || 'w-5 h-5';
    const strokeWidth = options.strokeWidth ?? 1.5;
    
    // Combine classes: ensure size, shrink-0 and transition
    const classes = [sizeClass, 'shrink-0', options.className || ''].filter(Boolean).join(' ');
    const styleAttr = options.color && options.color !== 'currentColor' ? ` style="color: ${options.color};"` : '';

    return `<svg class="${classes}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${styleAttr}>${paths}</svg>`;
}

/**
 * Extract paths from an existing SVG string or return clean paths
 */
export function extractSvgPaths(svgString: string): string {
    if (!svgString) return '';
    const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match ? match[1].trim() : svgString.trim();
}

/**
 * Robustly match any SVG markup (from Lucide, Heroicons, or templates) to the corresponding icon ID in ICON_CATALOG
 */
export function matchSvgToCatalog(svgString: string): string | null {
    if (!svgString) return null;

    const lower = svgString.toLowerCase();

    // 1. Check for explicit icon name in class name or data attributes (e.g. lucide-mail, icon-mail)
    const classOrAttrMatch = lower.match(/(?:lucide|icon)-([a-z0-9-]+)/i);
    if (classOrAttrMatch) {
        const found = ICON_CATALOG.find(i => i.id === classOrAttrMatch[1]);
        if (found) return found.id;
    }

    const norm = lower.replace(/[^a-z0-9]/g, '');

    // 2. High-precision path signatures for common Lucide/Heroicon coordinates
    const signatures: Array<{ id: string; patterns: string[] }> = [
        { id: 'mail', patterns: ['44h16', '226', 'm227', '226l107l26', 'm44h16c1102', 'rectwidth20height16x2y4'] },
        { id: 'arrow-right', patterns: ['512h14', '125l77', 'm12577', '512h14m125l77', '1257777'] },
        { id: 'arrow-left', patterns: ['1912h5', '1219l77', 'm121977', '12197777'] },
        { id: 'arrow-up', patterns: ['5127777', '1219v5'] },
        { id: 'arrow-down', patterns: ['125v14', '19127777'] },
        { id: 'arrow-up-right', patterns: ['717l1010', '77h10v10', '7171010'] },
        { id: 'arrow-down-right', patterns: ['77l1010', '177v10h10'] },
        { id: 'chevron-right', patterns: ['918l6666', '9186666', 'm9186666'] },
        { id: 'chevron-left', patterns: ['1518l6666', '15186666', 'm15186666'] },
        { id: 'chevron-up', patterns: ['1815l6666', '18156666', 'm18156666'] },
        { id: 'chevron-down', patterns: ['69l6666', '696666', 'm696666'] },
        { id: 'external-link', patterns: ['1813v6', '153h6v6', '1014213'] },
        { id: 'terminal', patterns: ['417l66', '1219h8', 'm417l6666m1219h8'] },
        { id: 'search', patterns: ['2121', 'cx11cy11', 'circlecx11cy11r8'] },
        { id: 'phone', patterns: ['221692', '1979', '809991'] },
        { id: 'check', patterns: ['206917412', '206', 'circlecheck'] },
        { id: 'circle-check', patterns: ['circlecx12cy12r10', '912l2244'] },
        { id: 'x', patterns: ['186618', '661818', 'm186618'] },
        { id: 'trash-2', patterns: ['36h18', '196v14'] },
        { id: 'pencil', patterns: ['211746812', '384216174'] },
        { id: 'eye', patterns: ['206212348', '1075', 'cx12cy12r3'] },
        { id: 'eye-off', patterns: ['107335076', '1408414158'] },
        { id: 'copy', patterns: ['88', 'width14height14', 'rectx8y8'] },
        { id: 'code-xml', patterns: ['1618', '86', '161866', '8666'] },
        { id: 'menu', patterns: ['412h16', '46h16', '418h16'] },
        { id: 'sparkles', patterns: ['123', 'm123', '993245'] },
        { id: 'star', patterns: ['122', 'polygon', '122150985'] },
        { id: 'heart', patterns: ['1914c149', '2084461'] },
        { id: 'shield', patterns: ['1222s84810v5', '1222'] },
        { id: 'shield-check', patterns: ['912l2244', '1222'] },
        { id: 'lock', patterns: ['rectwidth18height11', '711v7a55'] },
        { id: 'lock-open', patterns: ['711v7a5500199'] },
        { id: 'credit-card', patterns: ['rectwidth20height14', '210h20'] },
        { id: 'shopping-cart', patterns: ['cx8cy21', 'cx19cy21', '11h4l268'] },
        { id: 'shopping-bag', patterns: ['6212h12', '1610a44'] },
        { id: 'briefcase', patterns: ['1621v2a22', 'rectwidth20height14'] },
        { id: 'user', patterns: ['1921v2a44', 'cx12cy7r4'] },
        { id: 'users', patterns: ['1621v2a44', 'cx9cy7r4'] },
        { id: 'globe', patterns: ['circlecx12cy12r10', '122a153'] },
        { id: 'image', patterns: ['rectwidth18height18', 'circlecx9cy9', '2115l55'] },
        { id: 'camera', patterns: ['14532a22', 'circlecx12cy13r4'] },
        { id: 'video', patterns: ['237l7575v10', 'rectwidth15height14'] },
        { id: 'play', patterns: ['polygonpoints531912521'] },
        { id: 'pause', patterns: ['rectx6y4width4height16'] },
        { id: 'music', patterns: ['circlecx55cy175', '918v12'] },
        { id: 'zap', patterns: ['polygonpoints1323141214112213'] },
        { id: 'flame', patterns: ['85145a66', '122c15'] },
        { id: 'tag', patterns: ['20591341', 'circlecx7cy7'] },
        { id: 'award', patterns: ['circlecx12cy8r7', '821l4242'] },
        { id: 'trending-up', patterns: ['polylinepoints2271351685217'] },
        { id: 'chart-bar', patterns: ['linex112x212y120y210'] },
        { id: 'refresh-cw', patterns: ['2112a99', '213v5h5'] },
        { id: 'rotate-ccw', patterns: ['312a99', '33v5h5'] },
        { id: 'sliders-horizontal', patterns: ['linex121x214y14y24'] },
        { id: 'settings', patterns: ['122v2', 'circlecx12cy12r3'] },
        { id: 'message-square', patterns: ['2115a22', '7l44v5'] },
        { id: 'message-circle', patterns: ['7920a99', '222z'] },
        { id: 'send', patterns: ['222l1113', '22215221113'] },
        { id: 'bell', patterns: ['68a66', '103177'] },
        { id: 'at-sign', patterns: ['circlecx12cy12r4', '168v5a33'] },
        { id: 'circle-alert', patterns: ['circlecx12cy12r10', 'linex112x212y18y212'] },
        { id: 'info', patterns: ['circlecx12cy12r10', 'linex112x212y116y212'] },
        { id: 'circle-help', patterns: ['circlecx12cy12r10', '909a33'] },
        { id: 'lightbulb', patterns: ['1514c414', '918h6'] },
        { id: 'laptop', patterns: ['2016v4a22', '318h18'] },
        { id: 'smartphone', patterns: ['rectwidth14height20', 'linex112x21201y118y218'] },
        { id: 'monitor', patterns: ['rectwidth20height14', '821h8'] },
    ];

    for (const sig of signatures) {
        if (sig.patterns.some(p => norm.includes(p))) {
            return sig.id;
        }
    }

    // 3. Normalized path inclusion match against all items in ICON_CATALOG
    for (const item of ICON_CATALOG) {
        const itemNorm = item.paths.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemNorm && (norm.includes(itemNorm) || itemNorm.includes(norm))) {
            return item.id;
        }
    }

    return null;
}

