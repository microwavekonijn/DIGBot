import {CategoryChannel, Snowflake, VoiceChannel} from 'discord.js';
import {Group} from './entities/group.entity';
import {Channel} from './entities/channel.entity';
import {Injectable} from '@nestjs/common';
import {SyncService} from '../foundation/sync/sync.service';

@Injectable()
export class ModularChannelContainer {
    private readonly groups = new Set<Group>();
    private readonly channels = new Map<Snowflake, Channel>();
    private readonly parents = new Map<Snowflake, Group>();

    constructor(
        private readonly syncService: SyncService
    ) {
    }

    getChannel(channel: VoiceChannel): Channel | undefined {
        return this.channels.get(channel.id);
    }

    getGroupFromParent(category: CategoryChannel): Group | undefined {
        return this.parents.get(category.id);
    }

    initGroup(group: Group): void {
        this.groups.add(group);
        group.channels.forEach(channel => this.channels.set(channel.id, channel));
        if (group.parentId) this.parents.set(group.parentId, group);
    }

    updateGroup(group: Group, data: Partial<Group>): void {
        Object.assign(group, data);

        this.syncService.save(group);
    }

    deleteGroup(group: Group): boolean {
        group.channels.forEach(({id}) => this.channels.delete(id));
        if (group.parentId) this.parents.delete(group.parentId);
        const result = this.groups.delete(group);

        this.syncService.delete(group);
        return result;
    }

    addChannel(channel: Channel): void {
        channel.group.channels.push(channel);
        this.channels.set(channel.id, channel);

        this.syncService.save(channel);
    }

    updateChannel(channel: Channel, data: Partial<Channel>): void {
        Object.assign(channel, data);

        this.syncService.save(channel);
    }

    deleteChannel(channel: Channel): void {
        this.channels.delete(channel.id);
        channel.group.removeChannel(channel);

        this.syncService.delete(channel);
    }
}