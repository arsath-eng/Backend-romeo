import { Module } from "@nestjs/common";
import { SocketClient } from "./socket-client";

@Module({
    imports: [],
    providers: [SocketClient],
    exports: [SocketClient]
})
export class SocketModule {}