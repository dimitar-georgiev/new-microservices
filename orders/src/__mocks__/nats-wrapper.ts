export const natsWrapper = {
    // client: {
    //     publish: (subject: string, data: string, callback: () => void) => {
    //         callback();
    //     }
    // }
    client: {
        publish: jest.fn().mockImplementation(
            (subject: string, data: string, callback: () => void) => {
                callback();
            }
        )
    }
};