"use client"

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';

type userType = {
    email: string | null,
    uid: string,
    emailVerified: boolean,
}

type todoType = {
    id:string
    todo: string;
    isComplete: boolean;
}

type AuthContextProviderType = {
    children: ReactNode
}

type authContexType = {
    user: userType | null
    userName: string
    todoData: todoType[];

}

const AuthContext = createContext<null | authContexType>(null)

export default function AuthContextProvider({ children }: AuthContextProviderType) {
    const [user, setUser] = useState<null | userType>(null);
    const [userName, setUserName] = useState<string>("");
    const [todoData, setTodoData] = useState<todoType[]>([]);
    const router = useRouter();

    useEffect(() => console.log(todoData), [todoData])
    useEffect(() => {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const { email, uid, emailVerified } = user;
                setUser({ email, uid, emailVerified });
                // console.log(user, "inside on auth change");

                if (emailVerified) {
                    // console.log("start");
                    (async () => {
                        try {
                            const userDoc = doc(db, "users", uid);
                            const docSnap = await getDoc(userDoc);
                            if (docSnap.exists()) {
                                const fetchedUserName = docSnap.data().user_name;
                                setUserName(fetchedUserName);
                                // console.log(fetchedUserName);
                            } else {
                                console.log("No such document!");
                            }
                        } catch (error) {
                            console.error("Error fetching user name:", error);
                        }
                    })();
                    (async () => {
                        const TodosDocs = collection(db, "todos")
                        const currentUserId = auth.currentUser?.uid;

                        const condition = where("uid", "==", currentUserId)
                        const q = query(TodosDocs, condition)

                        try {
                            const allTodosSnapShot = await getDocs(q);
                            allTodosSnapShot.forEach((todoo) => {
                                const todoList = todoo.data() as todoType;
                                todoList.id = todoo.id;
                                console.log(todoList);
                                setTodoData(prevTodos => [...prevTodos, todoList]);
                            })
                        } catch (e) {
                            console.log(e);
                        }
                    })();
                    router.push('/');

                } else {
                    router.push('/verifyEmail');
                }
            } else {
                setUser(null);
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, userName, todoData }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuthContext = () => useContext(AuthContext);
