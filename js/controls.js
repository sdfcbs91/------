procesvg.draw = {
    init: function (data, process) {
        var html = "";
        //首先画出流程图的起点
        html += this.start(data, process);
        //画出每个节点
        if (data.child) html += this.child(data, process);
        return html;
    },
    /*
    此函数用于定于原点即起点的流程图
    参数：[该json数据][process对象]
    */
    start: function (data, process) {
        if (!data) return '';
        var con_svg = data.svg.control,
            html = '<rect data_process="' + con_svg.name + '" x="' + con_svg.x + '" y="' + con_svg.y + '" rx="' + con_svg.rx + '" ry="' + con_svg.ry + '"width="' + con_svg.width + '" height="' + con_svg.height
             + '" class="probox"/>';
        html += '<text data_process="' + con_svg.name + '" x="' + (con_svg.x + con_svg.width / 2) + '" y="' + (con_svg.y + 20)
             + '" class="proboxTit">' + data.name + '</text>';
        html += '<line data_process="' + con_svg.name + '" class="proboxspline" x1="' + (con_svg.x + 5) + '" y1="' + (con_svg.y + con_svg.height / 2) + '" x2="' + (con_svg.x + con_svg.width - 15) + '" y2="' + (con_svg.y + con_svg.height / 2) + '"/>';
        html += '<text data_process="' + con_svg.name + '" x="' + (con_svg.x + 75) + '" y="' + (con_svg.y + 50) + '" class="proboxMsg" >';
        if (process.options.process.createChildFunc) {
            html += process.options.process.createChildFunc(data, { x: con_svg.x + 75, y: con_svg.y + 50 });
        }
        html += '</text>';
        if (data.child) {
            if (data.child.length > 0) {
                html += '<image xlink:href="'+process.options.process.imgSrc+'back_process.png" data_process="' + con_svg.name + '" x="' + (con_svg.x + con_svg.width - 12) + '" y="' + (con_svg.y + con_svg.height / 2-5)  + '"width="10" height="10"'
             + ' class="protoggle"/>';
            }
        }
        return html;
    },
    child: function (child, process) {
        var html = '', parent = child;
        if (parent.constructor) {
            if (parent.constructor !== Array) {
                if (parent.child) var child = parent.child;
            }
        }
        if (!child.length) { return html; }
        for (var i = 0; i < child.length; i++) {
            var data = child[i],
                con_svg = data.svg.control,
                par_svg = parent.svg.control;
            html += '<rect data_process="' + con_svg.name + '" x="' + con_svg.x + '" y="' + con_svg.y + '" rx="' + con_svg.rx + '" ry="' + con_svg.ry + '" width="' + con_svg.width + '" height="' + con_svg.height
                 + '"class="probox"></rect>';
            html += '<text data_process="' + con_svg.name + '" x="' + (con_svg.x + 75) + '" y="' + (con_svg.y + 20)
                 + '" class="proboxTit" >' + data.name + '</text>';
            html += '<line data_process="' + con_svg.name + '" class="proboxspline" x1="' + (con_svg.x + 5) + '" y1="' + (con_svg.y + con_svg.height / 2)
                 + '" x2="' + (con_svg.x + con_svg.width - 15) + '" y2="' + (con_svg.y + con_svg.height / 2) + '"/>';
            html += '<text data_process="' + con_svg.name + '" x="' + (con_svg.x + 75) + '" y="' + (con_svg.y + 50) + '" class="proboxMsg" >';
            if (process.options.process.createChildFunc) {
                html += process.options.process.createChildFunc(data, { x: con_svg.x + 75, y: con_svg.y + 50 });
            }
            html += '</text>';
            if (data.child) {
                if (data.child.length > 0) {
                    html += '<image xlink:href="'+process.options.process.imgSrc+'back_process.png" data_process="' + con_svg.name + '" x="' + (con_svg.x + con_svg.width - 12) + '" y="' + (con_svg.y + con_svg.height / 2-5)  + '"width="10" height="10"'
                    + ' class="protoggle"/>';
                }
            }
            switch (process.options.process.lineStyle) {
                //直线   
                case "straightline":
                    html += '<polyline class="pierrePath" data_process="' + con_svg.name + '" points="' + (par_svg.x + par_svg.width) + ',' + (par_svg.y + par_svg.height / 2) + ' ' + con_svg.x + ',' + (con_svg.y + con_svg.height / 2) + '"/>';
                    break;
                //折现   
                case "brokenline":
                    html += '<polyline class="pierrePath" data_process="' + con_svg.name + '" points="' + process.getBrokenLine({ x: par_svg.x + par_svg.width, y: par_svg.y + par_svg.height / 2 }, { x: con_svg.x, y: con_svg.y + con_svg.height / 2 }) + '"/>';
                    break;
                //弧线(贝塞尔)   
                default:
                    html += '<path class="pierrePath" data_process="' + con_svg.name + '" d="' + process.getPierreTLine({ x: par_svg.x + par_svg.width, y: par_svg.y + par_svg.height / 2 }, { x: con_svg.x, y: con_svg.y + con_svg.height / 2 }) + '" stroke="blue" stroke-width="1" fill="none" />';
                    break;
            }
            if (data.child) {
                if (data.child.length > 0) {
                    html += this.child(data, process);
                }
            }

        }
        return html;
    }

}
procesvg.control = function (options) {
    this.options = $.extend(true,{
        data_level:[],
        process:{
            //是否启用
            enable:true,
            //线类型 straightline,brokenline,pierreTline
            lineStyle:"pierreTline"
        },
        tree:{
            enable:false
        }},options);
    this.redraw();
}
procesvg.control.prototype.redraw = function (options) {
    if (!options) {
        options = this.options;
    }
    if (options.process.enable) {
        //设置data数据坐标
        this.setDataPosition();
        //绘图
        var svgHTML = procesvg.svgHTMLS[0] + procesvg.draw.init(options.data, this) + procesvg.svgHTMLS[1];
        //由于IE9实现的SVG刷新机制不同(如果svg已存在浏览器中,svg元素的变化不会被IE9重绘),故把整个svg当作一个html字符串添加进container元素
        this.options.container.empty().append(svgHTML);
        //重设svg的大小
        this.svg = this.options.container.children().attr({ "height": this.options.svg.container_height, "width": this.options.svg.container_width });
        //定义图形事件
        this.setChartEvent();
    } else {
        //生成树形
        this.createTree();
        //设置事件
        this.setTreeEvent();
    }

}
procesvg.control.prototype.setDataPosition = function () {
    this.options.svg = {
        container_padding: 20,
        control_margin_top: 15,
        control_margin_left: 70,
        control_width: 150,
        control_height: 70,
        control_ends: [],
        load_index: 0 //记录生成的底层(显示的才能算做底层)模块数
    }
    var self = this,
        data = this.options.data,
        data_level = this.options.data_level,
        svg_config = this.options.svg,
        ends = 0,
    /*
    此函数用于获得某个数据节点的(纵向)最底层的模块数,
    参数:[某个数据节点][数组(可以不传入,如果传入则用来引用最底层的模块)]
    返回:该数据节点的最底层的模块数(如果该数据节点没有任何一个节点,则返回0)
    */
        getEndsVertical = function (child, arr) {
            var ends = 0, parent = null;
            if (child.constructor) {
                if (child.constructor !== Array) {
                    if (child.child) {
                        parent = child;
                        child = parent.child;
                    }
                }
            }
            if (!child.length) { return ends; }
            for (var i = 0; i < child.length; i++) {

                var data = child[i];
                if (parent) {
                    data.parent = parent;
                    if (data.svg) {
                        var p_control = parent.svg.control;
                        //如果父节点childvisible为false 或者 visible是false，那么该节点也应该是隐藏状态
                        if (p_control.childvisible === false || p_control.visible === false) {
                            data.svg.control.visible = false;
                        } else {
                            data.svg.control.visible = true;
                        }
                    }
                }

                if (data.child) {
                    if (data.child.length > 0) {
                        //判断该节点的子节点是否显示的
                        var blg = true;
                        for (var x = 0; x < data.child.length; x++) {

                            if (data.child[x].svg) {

                                if (data.child[x].parent) {
                                    var p_control = data.child[x].parent.svg.control;
                                    //如果父节点childvisible为false 或者 visible是false，那么该节点也应该是隐藏状态
                                    if (p_control.childvisible === false || p_control.visible === false) {
                                        data.child[x].svg.control.visible = false;
                                    } else {
                                        data.child[x].svg.control.visible = true;
                                    }
                                }
                                blg = data.child[x].svg.control.visible;

                            }
                        }
                        if (blg) {
                            if (arr) {
                                ends += getEndsVertical(data.child, arr);
                            } else {
                                ends += getEndsVertical(data.child);
                            }
                            
                            continue;
                        }else{
                            getEndsVertical(data.child);
                        }
                    }
                }
                var blg = true;
                if (data.svg) {
                    if (data.svg.control) {
                        blg = data.svg.control.visible;
                    }
                }
                //判断该节点是否显示的
                if (blg) {
                    ends += 1;
                    if (arr) arr.push(data);
                }
            }
            return ends;
        },

    /*设置获得层级数据data_level
    参数:[某个数据节点]
    返回:该数据节点(横向)的层级数组
    */
    getDataLevel = function (child, level, data_level) {
        if (arguments.length < 2) var level = 1, data_level = [];
        if (child.constructor) {
            if (child.constructor !== Array) {
                var temp = [];
                temp.push(child);

                data_level.push(temp);

                if (child.child) child = child.child;
            }
        }
        if (!child.length) { return level; }
        for (var i = 0; i < child.length; i++) {
            var data = child[i];
            if (data_level) {

                if (data_level.length < level + 1) {
                    data_level.push([]);
                }
                var len = level === 0 ? 1 : level;
                if (data_level.length < len + 1) {
                    data_level.push([]);
                }
                data_level[len].push(data);

            }
            if (data.child) {
                if (data.child.length > 0) {

                    getDataLevel(data.child, level + 1, data_level);

                }
            }

        }
        return data_level;
    },
    /*
    此函数用于设置数据节点及以后节点的X,Y坐标,
    参数:[某个数据节点][数字标记,用于表示第几层级(如果是0则表示最外围,特别处理)]
    */
    /*根据层级数据(this.options.data_level)设置各模块的坐标x,y*/
        set = function () {
            var config = svg_config;
            for (var i = 0; i < data_level.length; i++) {
                var len = data_level[i].length;
                for (var j = 0; j < len; j++) {
                    var data = data_level[i][j];

                    var has = true;
                    if (typeof data.svg === 'undefined') {
                    } else if (data.svg) {
                        if (data.svg.control) {
                            has = data.svg.control.visible;
                        }
                    }
                    //如果该数据节点不显示
                    if (!has) {
                        continue;
                    }

                    //判断该数据节点是否为最底层模块
                    var index = indexOfEnds(data);

                    //如果是最底层模块
                    if (index !== -1) {
                        if (!data.svg) {
                            //添加一个标记,svg
                            data.svg = {
                                control: {
                                    name: (new Date()).getMilliseconds() + parseInt(Math.random() * 10000).toString(),
                                    x: config.container_padding + i * (config.control_width + config.control_margin_left),
                                    y: config.container_padding + index * (config.control_height + config.control_margin_top),
                                    rx: 10,
                                    ry: 10,
                                    width: 150,
                                    height: 70,
                                    visible: true,
                                    childvisible: true
                                },
                                line: []
                            };
                        } else {
                            data.svg.control.x = config.container_padding + i * (config.control_width + config.control_margin_left);
                            data.svg.control.y = config.container_padding + index * (config.control_height + config.control_margin_top);
                        }
                    } else {
                        var sibl_ends = 0, cur_ends = 0;

                        //取出此节点及上半兄弟节点部分的底层模块数
                        for (var x = 0; x < j; x++) {

                            var t = getEndsVertical(data_level[i][x]);
                            //如果小于1,那么取它自己(它的父节点存在,至少为1,没有父节点的只能是起始点)
                            var n = 1;
                            if (!data_level[i][x].svg.control.visible) n = 1;
                            sibl_ends += t < 1 ? n : t;
                        }
                        cur_ends = getEndsVertical(data);
                        if (!data.svg) {
                            //添加一个标记,svg
                            data.svg = {
                                control: {
                                    name: (new Date()).getMilliseconds() + parseInt(Math.random() * 10000).toString(),
                                    x: config.container_padding + i * (config.control_width + config.control_margin_left),
                                    y: config.container_padding + sibl_ends * (config.control_height + config.control_margin_top) + cur_ends * (config.control_height + config.control_margin_top) / 2 - 35,
                                    rx: 10,
                                    ry: 10,
                                    width: 150,
                                    height: 70,
                                    visible: true,
                                    childvisible: true
                                },
                                line: []
                            };
                        } else {
                            data.svg.control.x = config.container_padding + i * (config.control_width + config.control_margin_left);
                            data.svg.control.y = config.container_padding + sibl_ends * (config.control_height + config.control_margin_top) + cur_ends * (config.control_height + config.control_margin_top) / 2 - 35;

                        }
                        //起点的控件y坐标特殊处理
                        if (i === 0 & j === 0) {
                            data.svg.control.y = config.container_padding + cur_ends * (config.control_height + config.control_margin_top) / 2 - 35;
                            if (data.svg.control.y < 35) {
                                data.svg.control.y = 35;
                            }

                        }
                    }
                }
            }
        }

    indexOfEnds = function (data) {
        var datas = svg_config.control_ends;
        for (var i = 0; i < datas.length; i++) {
            if (datas[i] === data) return i;
        }
        return -1;
    };
    //定义组装层级数据
    data_level = this.options.data_level = getDataLevel(data);
    //获得数据的最底层的模块数
    var ends = svg_config.ends = getEndsVertical(data, svg_config.control_ends);
    //获得数据的层级数
    var level = svg_config.level = data_level.length;
    //设置各个模块的坐标
    svg_config.container_height = ends * (svg_config.control_height + svg_config.control_margin_top) - svg_config.control_margin_top + (svg_config.container_padding * 2);
    svg_config.container_width = level * (svg_config.control_width + svg_config.control_margin_left) - svg_config.control_margin_left + (svg_config.container_padding * 2);
    set(data);
}

/*
    返回贝塞尔曲线(T 二次贝塞尔曲线平滑延伸)的需要参数值 
*/
procesvg.control.prototype.getPierreTLine = function (m, t) {
    //写死固定值 （q1距离起始点固定差15,q2点固定成t）
    var d = 'M ' + m.x + ' ' + m.y;
    if (m.x <= t.x && m.y <= t.y) {
        d += ' q 15 0 '; 
    } else if (m.x <= t.x && m.y >= t.y) {
        d += ' q 15 0 ';
    } else if (m.x >= t.x && m.y <= t.y) {
        d += ' q -15 0 ';
    } else {
        d += ' q -15 0 ';
    }
    d+= (t.x -m.x)/2+' '+(t.y-m.y)/2+' t '+(t.x -m.x)/2+' '+(t.y-m.y)/2 ;
    return d;
}

/*
    返回折线的需要参数值 
*/
procesvg.control.prototype.getBrokenLine = function (m, t) {
    //写死固定值(起始点横移位置10)
    var d = m.x + ',' + m.y
          + ' ' + (m.x + 10) + "," + m.y
          + ' ' + (m.x + 10) + "," + t.y
          + ' ' + t.x + "," + t.y;
    return d;
}

/*
    根据传入的数据name名,获得该具体的data
*/
procesvg.control.prototype.getDataByName = function (data, name) {
    if (data.svg) {
        if (data.svg.control) {
            if (data.svg.control.name === name) {
                return data;
            }
        }
    }
    if (!data.child) return null;
    var child = data.child;
    if (child.length > 0) {
        for (var i = 0; i < child.length; i++) {
            var d = this.getDataByName(child[i],name);
            if (d) return d;
        }
        return null;
    } else {
        return null
    }
}

/*
    根据传入的数据,获得该数据的子孙及之后的所有节点
*/
procesvg.control.prototype.getChildsByData = function (data, arr) {
    var child = [];
    if (!data.child) {
        child = data;
    } else {
        child = data.child;
    }
    if (!arr) var arr = [];

    if (!child.length) { return arr; }
    for (var i = 0; i < child.length; i++) {
        var data = child[i];
        arr.push(data);
        if (data.child) {
            if (data.child.length > 0) {
                this.getChildsByData(data.child, arr);
                continue;
            }
        }
    }
    return arr;
}

/*
    根据传入data，设置起点控件位置
*/
procesvg.control.prototype.setStartControlPositionByData = function (data) {
    var con_svg = data.svg.control,
        $container = this.options.container;
    $container.find('rect[data_process="' + con_svg.name + '"].probox').attr('x', con_svg.x).attr('y', con_svg.y);
    $container.find('text[data_process="' + con_svg.name + '"].proboxTit').attr('x', con_svg.x + con_svg.width / 2).attr('y', con_svg.y + 20);
    $container.find('line[data_process="' + con_svg.name + '"].proboxspline').attr('x1', con_svg.x + 5).attr('y1', con_svg.y+ con_svg.height / 2).attr('x2', con_svg.x + con_svg.width - 15).attr('y2',con_svg.y + con_svg.height / 2);
    $container.find('text[data_process="' + con_svg.name + '"].proboxMsg').attr('x', con_svg.x + con_svg.width / 2).attr('y', con_svg.y + 50);
    if (this.options.process.resetPostionFunc) {
        this.options.process.resetPostionFunc($container.find('text[data_process="' + con_svg.name + '"].proboxMsg'), {x:con_svg.x+con_svg.width / 2,y:con_svg.y+50})
    }
    $container.find('image[data_process="' + con_svg.name + '"].protoggle').attr('x', con_svg.x + con_svg.width - 12).attr('y', con_svg.y+ con_svg.height / 2-5);
    
}

/*
   根据传入data,设置对应该数据的控件位置
*/
procesvg.control.prototype.setControlPositionByData = function (child) {
    var parent = child,
        $container = this.options.container;
    if (parent.constructor) {
        if (parent.constructor !== Array) {
            if (parent.child) {
                var child = parent.child;
            }
        }
    }
    if (!child.length) { return; }
    for (var i = 0; i < child.length; i++) {
        var data = child[i],
                con_svg = data.svg.control,
                par_svg = parent.svg.control,
                display = 'block';

        if (data.svg.control.visible === false) {
            display = 'none';
        }

        $container.find('rect[data_process="' + con_svg.name + '"]').attr('x', con_svg.x).attr('y', con_svg.y).css('display', display);
        $container.find('text[data_process="' + con_svg.name + '"].proboxTit').attr('x', con_svg.x + con_svg.width / 2).attr('y', con_svg.y + 20).css('display', display);
       
        $container.find('line[data_process="' + con_svg.name + '"].proboxspline').attr('x1', con_svg.x + 5).attr('y1', con_svg.y+ con_svg.height / 2).attr('x2', con_svg.x + con_svg.width - 15).attr('y2',con_svg.y + con_svg.height / 2).css('display', display);
        $container.find('text[data_process="' + con_svg.name + '"].proboxMsg').attr('x', con_svg.x + con_svg.width / 2).attr('y', con_svg.y + 50).css('display', display);
        $container.find('image[data_process="' + con_svg.name + '"].protoggle').attr('x', con_svg.x + con_svg.width - 12).attr('y', con_svg.y+ con_svg.height / 2-5);
        if (this.options.process.resetPostionFunc) {
            this.options.process.resetPostionFunc($container.find('text[data_process="' + con_svg.name + '"].proboxMsg'), {x:con_svg.x+75,y:con_svg.y+50})
        }
        switch (this.options.process.lineStyle) {
            //直线                
            case "straightline":
                var points = (par_svg.x + par_svg.width) + ',' + (par_svg.y + par_svg.height / 2) + ' ' + con_svg.x + ',' + (con_svg.y + con_svg.height / 2);
                $container.find('polyline[data_process="' + con_svg.name + '"].pierrePath').attr('points', points).css('display', display);
                break;
            //折现                
            case "brokenline":
                var points = this.getBrokenLine({ x: par_svg.x + par_svg.width, y: par_svg.y + par_svg.height / 2 }, { x: con_svg.x, y: con_svg.y + con_svg.height / 2 });
                $container.find('polyline[data_process="' + con_svg.name + '"].pierrePath').attr('points', points).css('display', display);
                break;
            //弧线(贝塞尔)                
            default:
                var d = this.getPierreTLine({ x: par_svg.x + par_svg.width, y: par_svg.y + par_svg.height / 2 }, { x: con_svg.x, y: con_svg.y + con_svg.height / 2 });
                $container.find('path[data_process="' + con_svg.name + '"].pierrePath').attr('d', d).css('display', display);
                break;
        }
        if (data.child) {
            if (data.child.length > 0) {
                this.setControlPositionByData(data);
            }
        }

    }
}

/*
    重置当前图形的各节点位置,并重新设置图形大小
*/
procesvg.control.prototype.resetChartPosition = function (data, reset) {
    //重新设置data数据坐标
    this.setDataPosition();
    //重新设置起点坐标
    this.setStartControlPositionByData(data);
    //根据data,重新设置对应的控件坐标
    this.setControlPositionByData(data);

}

/*
    设置图形事件
*/
procesvg.control.prototype.setChartEvent = function () {
    var self = this,
        data = this.options.data,
        data_level = this.options.data_level,
        $container = this.options.container;
    this.svg.off().on('click', function (e) { e.preventDefault(); })
    .on('click', 'rect', function (e) {
        e.preventDefault();
        var cur_data = self.getDataByName(data, $(this).attr('data_process')),
            cur_control = $container.find('[data_process=' + cur_data.svg.control.name + ']'),
            childs_data = self.getChildsByData(cur_data),
            rect_control = $container.find('image[data_process=' + cur_data.svg.control.name + '].protoggle');
        if (!cur_data) return window.console.log('你点击的元素不存在对应的数据');
        var display = 'none';
        if (typeof cur_data.svg.control.childvisible === 'undefined') {
            cur_data.svg.control.childvisible = false;
        } else if (cur_data.svg.control.childvisible) {
            cur_data.svg.control.childvisible = false;
        } else {
            cur_data.svg.control.childvisible = true;
            display = 'block';
        }
        console.log(rect_control);
        cur_data.svg.control.childvisible ?
            (function () {
                rect_control.attr('class', 'protoggle').attr('xlink:href', self.options.process.imgSrc + 'back_process.png');
            })() : (function () { rect_control.attr('class', 'protoggle close').attr('xlink:href', self.options.process.imgSrc + 'stretch_process.png'); })();

        $.each(childs_data, function (i, d) {
            $container.find('[data_process=' + d.svg.control.name + ']').css('display', display);
            d.svg.control.visible = display === 'block' ? true : false;

        });
        //重置各个元素位置及容器的大小
        console.log(self);
        self.resetChartPosition(data, true);
    })
}

//生成树形节点
procesvg.control.prototype.createTree = function (options) {
    if (!options) {
        options = this.options;
    }
    var createLIline = function (parent, i) {
        var len = parent.length, rehtml = '';
        //判断是否为末尾的节点
        if (len > i + 1) {
            rehtml += '<div class="processtreeliLinesibl"></div>';
        } else {
            rehtml += '<div class="processtreeliLineend"></div>';
        }
        return '';
    },
    createULHtml = function (data, parent, i) {
        var isObj = false;
        if (data.constructor) {
            if (data.constructor !== Array) {
                isObj = true;
            }
        } else {
            return '';
        }
        var child = data.child,
            rehtml = '';
        if (isObj) {
            var rehtml = '<ul class="processtreeul">',
                haschild = true;
            if (!child) {
                haschild = false;
            } else if (child.length < 1) {
                haschild = false;
            }
            //根据是否有子节点做样式设置
            if (!haschild) {
                rehtml += '<li class="processtreeli"><div class="processnode">';
                //如果存在父节点,那么做对应的样式
                if (parent) {
                    rehtml += createLIline(parent, i);
                }
                //添加一个标记,svg
                data.svg = {
                    control: {
                        name:  (new Date()).getMilliseconds() + parseInt(Math.random() * 10000).toString(),
                        visible: true
                    },
                    line: []
                };
                rehtml += '<div class="processtreeliname" data_process="'+data.svg.control.name+'">' + data.name + '<div class="processtreetoggle"></div></div>';
                if (options.tree.createChildFuc) {
                    var r = options.tree.createChildFuc(data);
                    if (typeof r !== undefined) {
                        rehtml += r;
                    }
                }
                rehtml += '</div></li></ul>';
                return rehtml;
            } else {
                rehtml += '<li class="processtreeli processopen"><div class="processnode">';
                //如果存在父节点,那么做对应的样式
                if (parent) {
                    rehtml += createLIline(parent, i);
                }
                //添加一个标记,svg
                data.svg = {
                    control: {
                        name:  (new Date()).getMilliseconds() + parseInt(Math.random() * 10000).toString(),
                        visible: true
                    },
                    line: []
                };
                rehtml += '<div class="processtreeliname " data_process="'+data.svg.control.name+'">' + data.name + '<div class="processtreetoggle processopenchild"></div></div>';
                if (options.tree.createChildFuc) {
                    var r = options.tree.createChildFuc(data);
                    if (typeof r !== undefined) {
                        rehtml += r;
                    }
                }
                rehtml += '</div>';
            }

        } else {
            //如果当前的data是个数组则不必回调,回调无意义
            rehtml = '';
            child = data;
        }
        for (var i = 0; i < child.length; i++) {
            //如果当前传入的data是数组,那么下次递归的函数不用找它的父节点,递归应传入父节点
            if (!isObj) {
                rehtml += createULHtml(child[i]);
            }else{
                rehtml += createULHtml(child[i], child, i);    
            }
            
        }

        if (isObj) {
            rehtml += '</li></ul>';
        } else {
            rehtml += '';
        }
        return rehtml;
    },
        html = createULHtml(options.data);
    options.container.empty().append(html);
  
}

/*
    设置树形事件
*/
procesvg.control.prototype.setTreeEvent = function () {
    var data = this.options.data,
        $container = this.options.container;
    $container.children('ul').off().on('click', '.processtreetoggle.processopenchild', function () {
        //缩略
        var $this = $(this).removeClass('processopenchild').addClass('processclosechild'),
            $parent = $this.parent();
        $parent.parent().siblings().hide();
    }).on('click', '.processtreetoggle.processclosechild', function () {
        //展开
        var $this = $(this).removeClass('processclosechild').addClass('processopenchild'),
            $parent = $this.parent();
        $parent.parent().siblings().show();
    });
}