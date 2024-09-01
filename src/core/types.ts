export type LocationProps = {
    latitude: string,
    longitude: string,
    rssi: number
}

export type StartProps = {
    from: string,
    type: "channel" | "user"
}

export type StopProps = {
    from: string,
    type: "channel" | "user"
}