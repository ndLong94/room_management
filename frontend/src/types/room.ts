export type RoomStatus = 'VACANT' | 'OCCUPIED'

export interface Room {
  id: number
  propertyId: number
  name: string
  rentPrice: number
  status: RoomStatus
  contractUrl?: string | null
  paymentDay?: number | null
  depositAmount?: number | string | null
  depositDate?: string | null
  fixedElecAmount?: number | string | null
  fixedWaterAmount?: number | string | null
  /** Chỉ số điện/nước khởi điểm (nhập lúc chuyển Trống → Cho thuê). Tháng đầu tính tiền = chỉ số hiện tại − chỉ số này; từ tháng 2 lấy theo tháng trước. */
  initialElecReading?: number | string | null
  initialWaterReading?: number | string | null
  invoiceRecipientOccupantId?: number | null
  createdAt: string
}

export interface CreateRoomInput {
  name: string
  rentPrice?: number
  status?: RoomStatus
  paymentDay?: number | null
  depositAmount?: number | null
  depositDate?: string | null
  fixedElecAmount?: number | null
  fixedWaterAmount?: number | null
  /** Chỉ số khởi điểm khi tạo phòng Cho thuê và nhập chỉ số đồng hồ. */
  initialElecReading?: number | null
  initialWaterReading?: number | null
}

export interface UpdateRoomInput {
  name: string
  rentPrice: number
  status: RoomStatus
  contractUrl?: string | null
  paymentDay?: number | null
  depositAmount?: number | null
  depositDate?: string | null
  fixedElecAmount?: number | null
  fixedWaterAmount?: number | null
  /** Chỉ số khởi điểm khi chuyển sang Cho thuê và nhập chỉ số đồng hồ. */
  initialElecReading?: number | null
  initialWaterReading?: number | null
  invoiceRecipientOccupantId?: number | null
}
