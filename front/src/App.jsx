import './App.css'
import {useEffect, useState} from 'react'
import Cookies from 'js-cookie'

function App() {
    const [info, setInfo] = useState(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        console.log("js хуйня")
        const token = Cookies.get("token")
        if (token) {
            fetch("http://localhost:3000/getUserInfo", {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
                .then(res => res.json())
                .then(data => {
                    setInfo(data)
                })
        }
    }, []);

    function login() {
        fetch("http://localhost:3000/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {
                document.cookie = `token=${data.token}; path=/; max-age=3600`
            })
    }


    return (
        <>
            <div>
                <div>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button onClick={login}>Логин</button>
                </div>
            </div>
            {
                info != null &&
                <>
                    <h1>User Info</h1>
                    <p>{info.id}</p>
                    <p>{info.name}</p>
                    <p>{info.email}</p>
                </>
            }
        </>
    )
}

export default App
