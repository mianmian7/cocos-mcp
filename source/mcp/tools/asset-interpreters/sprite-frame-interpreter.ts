import { BaseAssetInterpreter } from "./base-interpreter";

export class SpriteFrameInterpreter extends BaseAssetInterpreter {
    get importerType() {
        return 'sprite-frame';
    }
}