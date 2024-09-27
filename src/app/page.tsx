"use client"

import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase/firebaseConfig";
import { useAuthContext } from "./context/authContext";
import { useState } from "react";
import { addDoc, collection, getFirestore } from "firebase/firestore";

export default function Home() {
  const { userName, todoData } = useAuthContext()!;
  const auth = getAuth(app)
  const db = getFirestore(app);
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [todo, setTodo] = useState<string>("")
  const signout = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.log(e);
    }
  }

  const saveTodo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const uid = auth.currentUser?.uid;
    const newTodo = { todo, uid, isComplete }

    try {
      const collectionRef = collection(db, "todos")
      await addDoc(collectionRef, newTodo);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <div className="flex justify-between px-10 py-4 bg-green-100 items-center">
        <h1 className="text-xl font-bold">Hello {userName}</h1>
        <button onClick={signout}>Log out</button>
      </div>
      <div className="flex flex-col w-[50%] gap-5">
        <input className="border border-black w-fit" type="text"
          value={todo}
          onChange={e => setTodo(e.target.value)} />
        <div className="flex items-center gap-3 ">
          <label htmlFor="check">Is Complete</label>
          <input type="checkbox"
            id="check"
            checked={isComplete}
            onChange={e => setIsComplete(e.target.checked)} />
        </div>
        <button className="w-28 border border-black" onClick={saveTodo}>Save</button>
      </div>
      <div className="mt-2">
        {/* {todoData && todoData.length > 0 ? (
          } */}
        {todoData.length > 0 ? todoData.map(({ id, todo, isComplete }) => (
          <div key={id} className="flex gap-5">
            <li>{todo}</li>
            <div className="h-5 w-[1px] bg-black"></div>
            <h2>{isComplete ? "Completed" : "Incomplete"}</h2>
          </div>
        )): <p>hello</p> }
      </div>
    </>
  );
}
