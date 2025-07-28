export type OutgoingInstruction = {
    icon?: string;
    generate: (type?: string) => Promise<string> | string;
}
