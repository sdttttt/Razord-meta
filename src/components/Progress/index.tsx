import classnames from 'classnames'

import { SubscriptionInfo } from '@lib/request'
import { BaseComponentProps } from '@models/BaseProps'

import './style.scss'
interface ProgressProps extends BaseComponentProps {
    subscriptionInfo?: SubscriptionInfo
}

export function Progress (props: ProgressProps) {
    const { subscriptionInfo, className: cn, style: s } = props
    const className = classnames('progress', cn)
    const style: React.CSSProperties = { ...s }
    const spanProps = { ...props, className, style }

    const used = subscriptionInfo ? formatBytes(subscriptionInfo?.Download + subscriptionInfo?.Upload) : 0
    const total = subscriptionInfo ? formatBytes(subscriptionInfo.Total) : 0
    const percentage = subscriptionInfo ? (((subscriptionInfo.Download + subscriptionInfo.Upload) / subscriptionInfo.Total) * 100).toFixed(2) : 0

    return (
        <div {...spanProps}>
            <div className="progress-info" >{used} / {total} ({percentage.toString() + '%'})</div>
            <div className="progress-fill" style={{ width: (percentage).toString() + '%' }}></div>
        </div>
    )
}

function formatBytes (bytes: number, decimals = 2) {
    if (bytes) {
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    } else {
        return '0 Bytes'
    }
}
