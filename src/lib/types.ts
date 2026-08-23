/** Los mismos cuatro objetos que en Anonimas/Models/GameModels.swift. */

export type GamePhase = "lobby" | "asking" | "answering" | "reveal";

export interface Room {
  id: string;
  code: string;
  phase: GamePhase;
  round: number;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  avatar: number;
  is_host: boolean;
  submitted_question: boolean;
  answered_count: number;
}

/** Sin autor y sin fecha, igual que en la base de datos. */
export interface Question {
  id: string;
  text: string;
  /** Lo decide quien la escribe: si está activo, se puede responder con foto. */
  allows_images: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  /** Ruta dentro del bucket de Storage, no una URL: las URLs se firman al
   *  mostrarlas y caducan. `null` en la inmensa mayoría de respuestas. */
  image_path: string | null;
}

export interface RoomEntry {
  room: Room;
  player: Player;
}

export interface RevealItem {
  question: Question;
  answers: Answer[];
}

export type ReportKind = "question" | "answer";
