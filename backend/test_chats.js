const Chat = require('./models/Chat');
const { query } = require('./config/database');

async function testChats() {
  try {
    console.log('📋 Mengambil semua user dari database...');
    const users = await query('SELECT id, full_name, role FROM users');
    console.log(`Ditemukan ${users.length} user.`);
    
    for (const user of users) {
      console.log(`\n👤 Menguji Chat untuk User: ${user.full_name} (ID: ${user.id}, Role: ${user.role})...`);
      
      try {
        const chats = await Chat.getChatOrders(user.id);
        console.log(`✅ getChatOrders berhasil! Mengembalikan ${chats.length} baris.`);
        if (chats.length > 0) {
          console.log('Sample chat order:', JSON.stringify(chats[0], null, 2));
        }
      } catch (err) {
        console.error(`❌ getChatOrders GAGAL untuk user ${user.id}:`, err.message);
      }
    }

    console.log('\n💬 Mengambil beberapa pesan dari tabel chats...');
    const chatSample = await query('SELECT * FROM chats LIMIT 5');
    console.log('Sampel pesan chats:', JSON.stringify(chatSample, null, 2));

    console.log('\n📦 Mengambil beberapa order dari tabel orders...');
    const orderSample = await query('SELECT id, buyer_id, seller_id, title, status FROM orders LIMIT 5');
    console.log('Sampel orders:', JSON.stringify(orderSample, null, 2));

  } catch (err) {
    console.error('Error global:', err.message);
  }
}

testChats();
