import React, { useRef, useEffect } from 'react';
import './LogView.css';

const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
};

function LogView(props) {
    const entries = props.logContent.map((content, index) =>
        <li key={index}>
            {content.date}: {content.content}
        </li>);
    return (
        <div className="Log">
            <ul>
                {entries}
                <AlwaysScrollToBottom />
            </ul>
        </div>
    );
}

export default LogView;
