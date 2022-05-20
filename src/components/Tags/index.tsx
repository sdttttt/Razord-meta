import classnames from 'classnames'
import { useState, useRef, useLayoutEffect, useMemo } from 'react'

import { noop } from '@lib/helper'
import { BaseComponentProps } from '@models'
import { useI18n } from '@stores'

import './style.scss'

const ProxyColors = {
    '#909399': 0,
    '#00c520': 260,
    '#ff9a28': 600,
    '#ff3e5e': Infinity,
}

interface TagsProps extends BaseComponentProps {
    data: string[]
    onClick: (name: string) => void
    errSet?: Set<string>
    select: string
    rowHeight: number
    canClick: boolean
    delay: number
}

export function Tags (props: TagsProps) {
    const { className, data, onClick, select, canClick, errSet, rowHeight: rawHeight, delay } = props
    const { translation } = useI18n()
    const { t } = translation('Proxies')
    const [expand, setExpand] = useState(false)
    const [showExtend, setShowExtend] = useState(false)

    const ulRef = useRef<HTMLUListElement>(null)
    useLayoutEffect(() => {
        setShowExtend((ulRef?.current?.offsetHeight ?? 0) > 30)
    }, [])

    const rowHeight = expand ? 'auto' : rawHeight
    const handleClick = canClick ? onClick : noop

    function toggleExtend () {
        setExpand(!expand)
    }

    const color = useMemo(
        () => Object.keys(ProxyColors).find(
            threshold => delay <= ProxyColors[threshold as keyof typeof ProxyColors],
        ),
        [delay],
    )
    const tags = data
        .map(t => {
            const click = canClick ? 'cursor-pointer' : 'cursor-default'
            const tagClass = classnames(click, { 'tags-selected': select === t, error: errSet?.has(t) })
            return (
                <li className={tagClass} key={t} onClick={() => handleClick(t)}>
                    { t } <span className="proxy-delay" style={{ color }}>&emsp;{delay === 0 ? '' : `${delay}ms`}  </span>
                </li>
            )
        })

    return (
        <div className={classnames('flex items-start overflow-y-hidden', className)} style={{ height: rowHeight }}>
            <ul ref={ulRef} className={classnames('tags', { expand })}>
                { tags }
            </ul>
            {
                showExtend &&
                <span className="h-7 px-5 select-none cursor-pointer leading-7" onClick={toggleExtend}>{ expand ? t('collapseText') : t('expandText') }</span>
            }
        </div>
    )
}
