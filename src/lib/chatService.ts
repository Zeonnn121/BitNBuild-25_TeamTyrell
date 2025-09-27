import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Message } from './types';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  userId: string;
}

export interface FirestoreChat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Timestamp;
  userId: string;
}

// Save a chat to Firestore
export const saveChat = async (chat: Chat): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chat.id);
    const firestoreChat: Omit<FirestoreChat, 'id'> = {
      title: chat.title,
      messages: chat.messages,
      updatedAt: Timestamp.fromDate(chat.updatedAt),
      userId: chat.userId
    };
    
    await setDoc(chatRef, firestoreChat);
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

// Load all chats for a user
export const loadUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const chats: Chat[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<FirestoreChat, 'id'>;
      chats.push({
        id: doc.id,
        title: data.title,
        messages: data.messages,
        updatedAt: data.updatedAt.toDate(),
        userId: data.userId
      });
    });
    
    return chats;
  } catch (error) {
    console.error('Error loading user chats:', error);
    throw error;
  }
};

// Delete a chat from Firestore
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'chats', chatId));
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// Delete all chats for a user (used on logout)
export const deleteAllUserChats = async (userId: string): Promise<void> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all user chats:', error);
    throw error;
  }
};