export type ChatLike = {
  unread_count?: number | string;
  buyer_id?: number | string;
  seller_id?: number | string;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Hitung total unread untuk role tertentu.
 *
 * Catatan:
 * - Jika backend hanya mengirim unread_count agregat per percakapan, maka perhitungan cukup jumlahkan.
 * - Jika backend juga mengirim buyer_id/seller_id per chat, kita bisa filter agar role-specific.
 */
export function getTotalUnreadChatsForRole(
  chats: ChatLike[] | undefined | null,
  role: 'seller' | 'user' | string | null | undefined,
  currentUserId?: number | string | null
): number {
  const list = Array.isArray(chats) ? chats : [];
  const userRole = role === 'seller' ? 'seller' : 'user';
  const me = currentUserId != null ? toNumber(currentUserId) : null;

  // Jika bisa filter berdasarkan buyer_id/seller_id + id user saat ini, lakukan.
  const canFilter = me != null && list.some((c) => c.buyer_id != null || c.seller_id != null);

  const filtered = canFilter
    ? list.filter((c) => {
        const buyerId = c.buyer_id != null ? toNumber(c.buyer_id) : null;
        const sellerId = c.seller_id != null ? toNumber(c.seller_id) : null;

        if (userRole === 'seller') {
          // Seller unread adalah percakapan yang milik seller saat ini.
          return sellerId != null ? sellerId === me : false;
        }
        // User(buyer)
        return buyerId != null ? buyerId === me : false;
      })
    : list;

  return filtered.reduce((sum, chat) => sum + toNumber(chat.unread_count), 0);
}

