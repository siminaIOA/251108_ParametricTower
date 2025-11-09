declare module 'three/examples/jsm/exporters/OBJExporter' {
  import type { Object3D } from 'three';

  export class OBJExporter {
    parse(object: Object3D): string;
  }
}

declare module 'three-stdlib/exporters/FBXExporter' {
  import type { Object3D } from 'three';

  export class FBXExporter {
    parse(object: Object3D): string | ArrayBuffer;
  }
}
