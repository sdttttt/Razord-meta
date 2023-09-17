
import { useEffect, useRef, useState, useRe } from 'react'
import { Select, Card, Header } from '@components'
import { Log } from '@models/Log'
import { useConfig, useI18n, useLogsStreamReader } from '@stores'

import './style.scss'
import { current } from 'immer'

const logLevelOptions = [
    { label: 'Default', value: '' },
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warn', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Silent', value: 'silent' },
]
const logMap: { [k: string]: string } = {
    debug: 'text-teal-500',
    info: 'text-sky-500',
    warning: 'text-pink-500',
    error: 'text-rose-500',
}

function useInterval (callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>()

    // 保存新回调
    useEffect(() => {
        savedCallback.current = callback
    })

    // 建立 interval
    useEffect(() => {
        function tick () {
            if (savedCallback.current) savedCallback.current()
        }
        if (delay !== null) {
            const unset = setInterval(tick, delay)
            return () => clearInterval(unset)
        }
    }, [delay])
}

export default function Logs () {
    const listRef = useRef<HTMLUListElement>(null)
    const logsRef = useRef<Log[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const logsStreamReader = useLogsStreamReader()
    const logs3600S = useRef<number[]>([])

    const count = useRef(0)
    const countMark = useRef(0)

    useInterval(() => {
        logs3600S.current = [...logs3600S.current, count.current - countMark.current]
        countMark.current = count.current
        const n = logs3600S.current.reduce((t, v) => (t + v), 0) / logs3600S.current.length
        document.title = `(${Math.floor(n)}/s)${count.current}`
    }, 1000)

    useEffect(() => {
        const logLevelLenMax = Object.keys(logMap).map(t => t.length).reduce((total, v) => (total > v ? total : v))
        console.log(`logLevelLenMax: ${logLevelLenMax}`)

        function handleLog (newLogs: Log[]) {
            if (!newLogs || newLogs.length === 0) {
                return
            }

            const appendLogs = newLogs.map(d => {
                count.current = count.current + 1
                let t = `${d.type.toUpperCase()}`
                if (t.length < logLevelLenMax) {
                    const fillLen = logLevelLenMax - t.length
                    for (let i = 0; i < fillLen; i++) {
                        t = `${t}\u00A0`
                    }
                }
                return ({ ...d, t, id: count.current })
            })

            logsRef.current = logsRef.current.slice(-200).concat(appendLogs)
            setLogs(logsRef.current)
        }

        if (logsStreamReader != null) {
            logsStreamReader.subscribe('data', handleLog)
            logsRef.current = []
            setLogs(logsRef.current)
        }
        return () => logsStreamReader?.unsubscribe('data', handleLog)
    }, [logsStreamReader])

    useEffect(() => {
        const curr = listRef.current
        if (!curr) return

        const {
            scrollTop, // 当前高度
            scrollHeight, // 总内容高度
            clientHeight, // 可视高度
        } = curr

        // 说明手动滚动到最下面的了, 100是误差值, 快速的日志滚动可能导致该数值有浮动出现不为0的情况
        if ((scrollHeight - clientHeight - scrollTop) <= 100) {
            curr.scrollTop = curr.scrollHeight
        }
    },
    [logs])

    return (
        <div className="page">
            <div className="flex flex-col flex-1 ">
                <ul className="logs-panel" ref={listRef}>
                    {
                        logs.map(
                            (log, index) => (
                                <li className="leading-3 inline-block" key={index}>
                                    <span className="mr-1 text-orange-400">{'<'}{log.id}{'>'}{ log.time }</span>
                                    <span className={logMap[log.type]}>{ log.t }</span>
                                    <span className="ml-1">{ log.payload }</span>
                                </li>
                            ),
                        )
                    }
                </ul>
                <pre className="mr-1 text-orange-400">{`${Math.floor(logs3600S.current.reduce((t, v) => (t + v), 0) / logs3600S.current.length)}/s max=${Math.max(...logs3600S.current)} min=${Math.min(...logs3600S.current)} total${count.current}`}</pre>
            </div>
        </div>
    )
}
/* The above code is declaring a readonly property called `shadowRoot` which can hold a value of
either `ShadowRoot` or `null`. */
