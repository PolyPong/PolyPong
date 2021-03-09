enum ClientAction {
    JoinLobby,
    CreateLobby,
}

enum ServerEvent {
    LobbyCreated,
    Error,
}

interface JoinGamePayload {
    lobby_id: string,
    user_id: string,
}

interface LobbyCreatedPayload{
    lobby_id: string
}

interface ServerResponse<T> {
    event: ServerEvent,
    data: T
}

interface ClientResponse<T> {
    action: ClientAction,
    data: T
}

/*
for example: we can get a ServerResponse<LobbyCreated>
and that tells us we can expect a response from the server that looks like this in the frontend:
{
    event: ServerEvent.LobbyCreated,
    data: {
        lobby_id: "1234-5678-1234"
    }
}

or we can get a ClientAction<JoinLobby> from the client in the server
{
    action: ClientAction.JoinLobby,
    data: {
        lobby_id: "1234-5678-1234",
        user_ud: "1234-5678-1234"
    }
}
*/