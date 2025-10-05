class ambientBridgeDom {
    public static dom = {
        sendToServer: async (channel: string, ...args: any[]) => {
            return await window.ambientBridge.sendToServer(channel, ...args);
        },
        addResponse: (channel: string, callback: (event: any, ...args: any[]) => any) => {
            window.ambientBridge.addResponse(channel, async (event, ...args) => {
                return await callback(event, ...args);
            });
        }
    };
}