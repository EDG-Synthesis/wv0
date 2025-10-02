import { initViewer } from "./viewer.js";
import { initModels } from "./models.js";
import { initUI } from "./ui.js";

// Declarative routing
// - backdrop: keyed by Project
// - designsByProject: allowed Design values per Project
// - partsByProjectDesign: models keyed by Project → Design → slider combo key
const ASSETS = {
  backdropByProject: {
    private: [
      { url: "src/walls.gltf",    material: "stucco"   },
      { url: "src/floor.gltf",    material: "floor"    },
      { url: "src/wainscot.gltf", material: "wainscot" },
      { url: "src/counter.gltf",   material: "marble"  },
      { url: "src/kicker.gltf",   material: "blacksteel"  }
    ],
    office: [
      { url: "src/chairmetal.gltf",    material: "ssteel"   },
      { url: "src/desktop.gltf",   material: "woodlite"  },
      { url: "src/rubber.gltf", material: "rubber" },
      { url: "src/slab.gltf",   material: "concrete"  },
      { url: "src/officewalls.gltf",   material: "stucco"  },
      { url: "src/officedesks.gltf",   material: "stucco"  }
    ],
    lobby: [
      {url: "src/l_chairmetal.gltf",   material: "ssteel"  },
      {url: "src/l_rubber.gltf",   material: "rubber"  },
      {url: "src/l_desk.gltf",   material: "marble"  },
      {url: "src/l_floor.gltf",   material: "plaster"  },
      {url: "src/l_wall.gltf",   material: "stucco"  }
    ]
  },

  // Controls which Design options appear for each Project
  designsByProject: {
    private: ["cloud", "noise", "brush"],
    office:  ["noise", "touch"],
    lobby: ["wall", "desk", "surround"],
  },

  // part mappings - use target:false to exclude from swatch changes
  // Key formats:
  //   cloud: "depth|angle|stretch"
  //   noise: "depth|scale"
  //   brush: "density|soften"
  //   touch: "size|rep"
  partsByProjectDesign: {
    private: {
      cloud: {
        "3|45|2": [{ url: "", material: "blacksteel" }],
      },
      noise: {
        "3|1": [{ url: "src/privatenoise3-1.gltf"}],
        "2|1": [{ url: "src/privatenoise2-1.gltf" }],
        "1|1": [{ url: "src/privatenoise1-1.gltf"}],
        "3|2": [{ url: "src/privatenoise3-2.gltf"  }],
        "2|2": [{ url: "src/privatenoise2-2.gltf"  }],
        "1|2": [{ url: "src/privatenoise1-2.gltf" }],
        "3|3": [{ url: "src/privatenoise3-3.gltf" }],
        "2|3": [{ url: "src/privatenoise2-3.gltf"  }],
        "1|3": [{ url: "src/privatenoise1-3.gltf"  }],
        "3|4": [{ url: "src/privatenoise3-4.gltf"  }],
        "2|4": [{ url: "src/privatenoise2-4.gltf"  }],
        "1|4": [{ url: "src/privatenoise1-4.gltf"  }],
        "3|5": [{ url: "src/privatenoise3-5.gltf"  }],
        "2|5": [{ url: "src/privatenoise2-5.gltf" }],
        "1|5": [{ url: "src/privatenoise1-5.gltf" }],
      },
      brush: {
        "2|2": [{ url: "", material: "blacksteel" }]
      }
    },
    office: {
      // You can share the same GLTFs between projects if identical
      noise: {
        "1|1": [{ url: "", material: "blacksteel" },{url:"", material: "stucco", target:false}]
      },
      touch: {
        "1|1": [{ url: "src/officetouch1-1.gltf", id:"ringlens" },{url:"src/t_shroud1-x.gltf", material: "stucco", target:false} ],
        "1|2": [{ url: "src/officetouch1-2.gltf",id:"ringlens"  },{url:"src/t_shroud1-x.gltf", material: "stucco", target:false} ],
        "1|3": [{ url: "src/officetouch1-3.gltf",id:"ringlens"  },{url:"src/t_shroud1-x.gltf", material: "stucco", target:false} ],
        "1|4": [{ url: "src/officetouch1-4.gltf",id:"ringlens"  },{url:"src/t_shroud1-x.gltf", material: "stucco", target:false} ],
        "2|1": [{ url: "src/officetouch2-1.gltf",id:"ringlens"  },{url:"src/t_shroud2-x.gltf", material: "stucco", target:false} ],
        "2|2": [{ url: "src/officetouch2-2.gltf",id:"ringlens"  },{url:"src/t_shroud2-x.gltf", material: "stucco", target:false} ],
        "2|3": [{ url: "src/officetouch2-3.gltf",id:"ringlens"  },{url:"src/t_shroud2-x.gltf", material: "stucco", target:false} ]
      }
    },
    lobby: {
      wall: {
        "3|1":[{url: "src/wall3-1.gltf"}],
        "3|2":[{url: "src/wall3-2.gltf"}],
        "3|3":[{url: "src/wall3-3.gltf"}],
        "3|4":[{url: "src/wall3-4.gltf"}],
        "3|5":[{url: "src/wall3-5.gltf"}],
        "2|1":[{url: "src/wall2-1.gltf"}],
        "2|2":[{url: "src/wall2-2.gltf"}],
        "2|3":[{url: "src/wall2-3.gltf"}],
        "2|4":[{url: "src/wall2-4.gltf"}],
        "2|5":[{url: "src/wall2-5.gltf"}],
      },
      desk: {

      },
      surround: {

      }
    },
    "*": {
      // optional fallbacks, e.g. {"*": {"*": { "anyKey": {...}}}}
    }
  }
};



window.addEventListener("DOMContentLoaded", () => {
  const ctx = initViewer("viewer");      // sets up Three + env + axes
  const models = initModels(ctx);        // sets up GLTF loader + helpers
  initUI(ctx, models, ASSETS);                   // wires dropdown + sliders + logic
});
