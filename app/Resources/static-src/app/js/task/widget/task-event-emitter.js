import postal from 'postal';
import 'postal.federation';
import 'postal.xframe';

export default class TaskPipe {
  constructor(element) {
    this.element = $(element);
    this.eventUrl = this.element.data('eventUrl');
    if (this.eventUrl === undefined) {
      throw Error('task event url is undefined');
    }

    this.eventDatas = {};
    this.intervalId = null;
    this.lastReportTime = this.element.data('lastReportTime');
    this.eventMap = {
      receives: {}
    };

    this._registerChannel();
    this._initInterval();
  }

  _registerChannel(){
    postal.instanceId('task');

    postal.fedx.addFilter([
      {
        channel: 'activity-events', //接收 activity iframe的事件
        topic: '#',
        direction: 'in'
      },
      {
        channel: 'task-events',  // 发送事件到activity iframe
        topic: '#',
        direction: 'out'
      }
    ]);

    postal.subscribe({
      channel: 'activity-events',
      topic: '#',
      callback: ({event, data}) => {
        this.eventDatas[event] = data;
        this._flush();
      }
    });

    return this;
  }

  _initInterval() {
    window.onbeforeunload = () => {  
      this._clearInterval(); 
      this._flush();
    } 
    this._clearInterval();
    let minute = 60 * 1000;
    this.intervalId = setInterval(() => this._flush(), minute);
  }

  _clearInterval() {
    clearInterval(this.intervalId);
  }

  _flush() {
    Object.assign(this.eventDatas, {
      'stay': {
        'lastReportTime': this.lastReportTime
      }
    });

    let ajax = $.post(this.eventUrl, {eventName: 'doing', data: this.eventDatas})
      .done((response) => {
        this._publishResponse(response);
        this.eventDatas = {};
      })
      .fail((error) => {
      });

    return ajax;
  }

  _publishResponse(response) {
    postal.publish({
      channel: 'task-events',
      topic: '#',
      data: { event: response.event, data: response.data }
    });
  }

  addListener(event, callback) {
    this.eventMap.receives[event] = this.eventMap.receives[event] || [];
    this.eventMap.receives[event].push(callback);
  }
}