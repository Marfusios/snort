import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as secp from '@noble/secp256k1';
import { bech32 } from "bech32";

import { setPrivateKey, setNip07PubKey } from "../state/Login";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const publicKey = useSelector(s => s.login.publicKey);
    const [key, setKey] = useState("");

    useEffect(() => {
        if (publicKey) {
            navigate("/");
        }
    }, [publicKey]);

    function doLogin() {
        if (key.startsWith("nsec")) {
            let nKey = bech32.decode(key);
            let buff = bech32.fromWords(nKey.words);
            let hexKey = secp.utils.bytesToHex(Uint8Array.from(buff));
            if (secp.utils.isValidPrivateKey(hexKey)) {
                dispatch(setPrivateKey(hexKey));
            } else {
                throw "INVALID PRIVATE KEY";
            }
        } else {
            if (secp.utils.isValidPrivateKey(key)) {
                dispatch(setPrivateKey(key));
            } else {
                throw "INVALID PRIVATE KEY";
            }
        }
    }

    async function makeRandomKey() {
        let newKey = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
        dispatch(setPrivateKey(newKey))
        navigate("/new");
    }

    async function doNip07Login() {
        let pubKey = await window.nostr.getPublicKey();
        dispatch(setNip07PubKey(pubKey));
    }

    function altLogins() {
        let nip07 = 'nostr' in window;
        if (!nip07) {
            return null;
        }

        return (
            <>
                <h2>Other Login Methods</h2>
                <div className="flex">
                    <div className="btn" onClick={(e) => doNip07Login()}>Login with Extension (NIP-07)</div>
                </div>
            </>
        )
    }

    return (
        <>
            <h1>Login</h1>
            <p>Enter your private key:</p>
            <div className="flex">
                <input type="text" placeholder="Private key" className="f-grow" onChange={e => setKey(e.target.value)} />
            </div>
            <div className="tabs">
                <div className="btn" onClick={(e) => doLogin()}>Login</div>
                <div className="btn" onClick={() => makeRandomKey()}>Generate Key</div>
            </div>
            {altLogins()}
        </>
    );
}