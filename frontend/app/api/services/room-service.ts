import { BaseService } from "./base-service";
import type {
  RoomMessage,
  RoomSummary,
  PaginatedResult,
  GetRoomsParams,
  GetRoomMessagesParams,
  GetAllMessagesParams,
} from "../types";

export class RoomService extends BaseService {
  public async getRooms(
    params?: GetRoomsParams
  ): Promise<PaginatedResult<RoomSummary>> {
    return this.get<PaginatedResult<RoomSummary>>("/", {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
      cache: { enabled: true, ttl: 5000 },
    });
  }

  public async getRoomMessages(
    roomId: string,
    params?: GetRoomMessagesParams
  ): Promise<PaginatedResult<RoomMessage>> {
    return this.get<PaginatedResult<RoomMessage>>(`/${roomId}/messages`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 50,
      },
      cache: { enabled: true, ttl: 3000 },
    });
  }

  public async getAllMessages(
    params?: GetAllMessagesParams
  ): Promise<PaginatedResult<RoomMessage>> {
    return this.get<PaginatedResult<RoomMessage>>("/messages", {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 50,
      },
      cache: { enabled: true, ttl: 3000 },
    });
  }
}
