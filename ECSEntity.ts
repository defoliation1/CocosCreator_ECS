import {ECSWorld} from "./ECSWorld"
import {ECSComConstructor, GetComConstructorType } from "./ECSComponent";
import { ComPoolIndex, ComType } from "./Const";
import { ECSComponentPool } from "./ECSComponentPool";

/** 实体 */
export class Entity {
    public id: number;              // 唯一标识
    public index: number;           // 
    public dead: boolean;           // 

    // 实体上的组件, 存放的是ComponentPool的index
    private _components: Array<ComPoolIndex> = new Array<ComPoolIndex>(Object.keys(ComType).length).fill(-1);

    private _world: ECSWorld = null;
    public get world(): ECSWorld {
        return this._world;
    }
    public set world(world: ECSWorld) {
        this._world = world;
    }

    /** 获取实体上的组件 */
    public getComponent(typeOrFunc: ComType | ECSComConstructor): ComPoolIndex {
        let type = typeof typeOrFunc == 'number' ? typeOrFunc : GetComConstructorType(typeOrFunc);
        let comPoolIdx = this._components[type];
        if(comPoolIdx == -1) {
            console.error(`[Entity]: 没有找到对应的Component, type: ${type}`);
            return -1;
        }
        return comPoolIdx;
    }

    /** 添加组件 */
    public addComponent<T extends ECSComConstructor>(func: T): ComPoolIndex {
        let type = GetComConstructorType(func);
        if(this._components[type]) {
            return this._components[type];
        }
        let comPoolIdx = this._components[type] = this._world.getComponentPool<ECSComponentPool<T>>(func).alloc();
        this._world.setEntityDirty(this);
        return comPoolIdx;
    }

    /** 移除组件 */
    public removeComponent<T extends ECSComConstructor>(func: ECSComConstructor, dirty = true) {
        let comPoolIdx = this._components[GetComConstructorType(func)];
        if(comPoolIdx == -1) {
            console.error(`[ECSEntity]: removeComponent error, type: ${GetComConstructorType(func)}`);
            return false;
        }
        this._components[GetComConstructorType(func)] = -1;
        this._world.getComponentPool<ECSComponentPool<T>>(func).free(comPoolIdx);
        dirty && this._world.setEntityDirty(this);
        return true;
    }

    /** 移除所有组件 */
    public removeAllComponents(dirty: boolean) {
        for(let type = 0; type < this._components.length; type++) {
            let comPoolIdx = this._components[type];
            if(comPoolIdx == -1) continue;
            this._world.getComponentPool<ECSComponentPool<any>>(type).free(comPoolIdx);
        }
        this._components = [];
        if(dirty) {
            this._world.setEntityDirty(this);
        }
    }
}