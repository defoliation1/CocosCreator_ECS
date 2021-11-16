import { ComType, EntityIndex } from "./Const";
import { Entity } from "./ECSEntity";
import { ECSWorld } from "./ECSWorld";

export class ECSFillter {
    private _world: ECSWorld = null;

    private _entitiesMap = new Map<EntityIndex, boolean>();

    private _acceptComTypes: ComType[] = [];        // 接收的组件类型
    private _rejectComTypes: ComType[] = [];        // 拒绝的组件类型

    public constructor(world: ECSWorld, accepts?: ComType[], rejects?: ComType[]) {
        this._world = world;
        this._acceptComTypes = accepts && accepts.length > 0 ? accepts : this._acceptComTypes;
        this._rejectComTypes = rejects && rejects.length > 0 ? rejects : this._rejectComTypes;
    }

    public onEntityEnter(entity: EntityIndex) {
        if(this._entitiesMap.has(entity)) {
            console.warn(`[ECSFillter]: addEntity entity is had ${entity}`);
            return true;
        }
        this._entitiesMap.set(entity, true);
        return true;
    }

    public onEntityLeave(entity: EntityIndex) {
        if(!this._entitiesMap.has(entity)) {
            console.warn(`[ECSFillter]: removeEntity entity not had ${entity}`);
            return true;
        }
        this._entitiesMap.delete(entity);
    }

    public walk(callback?: (entity: number) => boolean) {
        this._entitiesMap.forEach((value, entity) => {
            callback(entity);
        });
    }

    public isAccept(entity: Entity) {
        for(let i = 0; i < this._acceptComTypes.length; i++) {
            if(!entity.getComponent(this._acceptComTypes[i])) {
                return false;
            }
        }
        for(let i = 0; i < this._rejectComTypes.length; i++) {
            if(entity.getComponent(this._rejectComTypes[i])) {
                return false;
            }
        }
        return true;
    }

    public isContains(entity: number) {
        return this._entitiesMap.has(entity);
    }


}