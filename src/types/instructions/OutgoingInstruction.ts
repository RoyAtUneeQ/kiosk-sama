export interface OutgoingInstruction {
    icon?: string;
    payload: any;
    generate: (type?: string) => Promise<string> | string;
}
