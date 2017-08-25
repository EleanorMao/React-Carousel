const React = require('react');
const Gesture = require('./gesture.js');

class Banner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: 0,
            width: 320,
            duration: 200,
            _transform: 'transform',
            _transitionDuration: 'transitionDuration'
        }
    }

    componentDidMount() {
        this.resizeWidth();
        let body = document.body;
        let _prefix = (() => {
            let vendors = ['t', 'WebkitT'],
                transform,
                l = vendors.length;

            for (; l--;) {
                transform = vendors[l] + 'ransform';
                if (transform in body.style) {
                    return vendors[l].slice(0, -1);
                }
            }

            return '';
        })();

        this._prefix = _prefix;
        this.setState({
            _transform: this._prefixStyle('transform'),
            _transitionDuration: this._prefixStyle('transitionDuration')
        });
        if (this.props.data.length > 1) this.bannerRun();
        document.addEventListener('resize', this.resizeWidth.bind(this), false);
        document.addEventListener(`${_prefix.toLowerCase() + (_prefix ? "T" : "t")}ransitionEnd`, this._transitionEnd.bind(this), false);
    }

    componentWillUnmount() {
        document.removeEventListener('resize', this.resizeWidth.bind(this), false);
    }

    _prefixStyle(style) {
        let _prefix = this._prefix;
        if (_prefix === '') return style;
        return _prefix + style.charAt(0).toUpperCase() + style.substr(1);
    }

    _transitionEnd() {
        this.setState(old => {
            if (old.checked === -1) {
                old.duration = 0;
                old.checked = this.props.data.length - 1;
            } else if (old.checked === this.props.data.length) {
                old.duration = 0;
                old.checked = 0;
            }
            return old;
        })
    }

    resizeWidth() {
        this.setState(old => {
            old.width = window.innerWidth || 320;
            return old;
        })
    }

    bannerRun() {
        this.time = setInterval(() => {
            this.setState(old => {
                old.checked++;
                if (old.checked < -1) {
                    old.checked = -1
                } else if (old.checked > this.props.data.length) {
                    old.checked = this.props.data.length
                }
                old.duration = 300;
                return old
            })
        }, 6000)
    }

    handleSwipeMove(i, e) {
        this.handleStop();
        let index = e.direction.toLocaleLowerCase() === 'right' ? i - 1 : i + 1;
        let length = this.props.data.length;
        if (index < -1) {
            index = -1
        } else if (index > length) {
            index = length
        }
        this.setState(old => {
            old.checked = index;
            old.duration = 300;
            return old;
        })
    }

    handleStop() {
        if (this.time) {
            window.clearInterval(this.time);
            this.time = null;
        }
    }

    handleSwipeEnd() {
        if (!this.time) {
            this.bannerRun();
        }
    }

    render() {
        let {data, onClick} = this.props;
        let {checked, width, duration, _transform, _transitionDuration} = this.state;
        let length = data.length;
        let cloned = length > 1;
        let style = {width: (cloned ? length + 2 : length) * width};
        style[_transform] = `translate3d(-${(cloned ? checked + 1 : checked) * width}px, 0px, 0px)`;
        style[_transitionDuration] = duration + 'ms';
        return (
            <div className="banner">
                <ul className="banner-list clearfix" style={style}>
                    {cloned &&
                    <Gesture
                        key="clonel" preventDefault={false}
                        onSwipeStart={this.handleStop.bind(this)}
                        onSwipeEnd={this.handleSwipeEnd.bind(this)}
                        onSwipeLeft={this.handleSwipeMove.bind(this, -1)}
                        onSwipeRight={this.handleSwipeMove.bind(this, -1)}
                    >
                        <li style={{width}}>
                            <img src={data[length - 1]}/>
                        </li>
                    </Gesture>}
                    {data.map((item, index) => {
                        return (
                            <Gesture
                                key={index} preventDefault={false}
                                onSwipeStart={this.handleStop.bind(this)}
                                onSwipeEnd={this.handleSwipeEnd.bind(this)}
                                onSwipeLeft={cloned ? this.handleSwipeMove.bind(this, index) : null}
                                onSwipeRight={cloned ? this.handleSwipeMove.bind(this, index) : null}
                            >
                                <li style={{width}}>
                                    <img src={item}/>
                                </li>
                            </Gesture>
                        )
                    })}
                    {cloned &&
                    <Gesture
                        key="clone" preventDefault={false}
                        onSwipeStart={this.handleStop.bind(this)}
                        onSwipeEnd={this.handleSwipeEnd.bind(this)}
                        onSwipeLeft={this.handleSwipeMove.bind(this, length)}
                        onSwipeRight={this.handleSwipeMove.bind(this, length)}
                    >
                        <li style={{width}}>
                            <img src={data[0]}/>
                        </li>
                    </Gesture>}
                </ul>
                {!!length &&
                <div className="page">
                    {data.map((item, index) => {
                        return (checked === index ||
                            (index === 0 && checked === length) ||
                            (index === length - 1 && checked === -1)) ?
                            <i className="banner-checked"/> :
                            <i className="banner-unchecked"/>
                    })}
                </div>}
            </div>
        )
    }
}

module.exports = Banner;

Banner.defaultProps = {
    data: []
};
