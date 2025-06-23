import { NotificationService } from "@flows/notifications/service/notifications.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { io, Socket } from 'socket.io-client'

@Injectable()
export class SocketClient 
{
    public socketClient: Socket;
    notificationService: NotificationService
    constructor(
        private readonly configService: ConfigService
    ) {
        this.socketClient = io(this.configService.get<string>('ENGINE_BACKEND_DOMAIN'), { path: '/engine/v1/socket.io' });
    }
    async sendNotificationRequest(data: any) {
        this.socketClient.emit('notificationRequest', data);
    }
    async sendNotificationAnnouncement(data: any) {
        this.socketClient.emit('notificationAnnouncement', data);
    }

    async sendNotificationResponse(data: any) {
        this.socketClient.emit('notificationResponse', data);
    }

    async sendDeleteAll(employeeId: string) {
        this.socketClient.emit('deleteAll', employeeId);
    }
}