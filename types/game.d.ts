declare global {
    interface Player {
      id: string;
      name: string;
      position: number;
      isAlive: boolean;
      color: string;
      startSide: 'left' | 'right';
    }
  
    interface ServerToClientEvents {
      playerJoined: (player: Player) => void;
      playerMoved: (data: { id: string; position: number }) => void;
      playerEliminated: (data: { id: string }) => void;
      playerLeft: (data: { id: string }) => void;
      robotStateChanged: (watching: boolean) => void;
    }
  
    interface ClientToServerEvents {
      joinGame: (name: string) => void;
      playerMove: (data: { position: number }) => void;
      checkMovement: (data: { id: string }) => void;
      updateRobotState: (watching: boolean) => void;
    }
  }
  
  export {};