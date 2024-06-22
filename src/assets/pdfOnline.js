(function () {
    var $ = layui.jquery
        , form = layui.form
        , table = layui.table
        , layer = layui.layer
        , laytpl = layui.laytpl
        , laydate = layui.laydate
        , element = layui.element
        , tenantId = APP.getHeaders('tenantId')
        , userId = APP.getHeaders('userId')
    ;

    let iframe = document.getElementById('myIframe');

    let x = '';
    let y = '';
    let _x = '';
    let _y = '';
    let pageNum = '';

    let isDragging = false;
    let startX, startY;

    let width = 0
    let height = 0

    // 比例
    let x1 = ''
    let x2 = ''
    let y1 = ''
    let y2 = ''
    let w = ''
    let h = ''
    // 当前选中的PDFSeq
    let pdfseq = ''
    let pdffilename = ''
    let pdffileurl = ''
    // 全局Pdf数据
    let pdfPageData = {};
    // 所有批注位置信息
    let pageAnnotations = {};

    let dataTableFX = null;
    let dataTableAna = null;

    function createRangeArray(center, range = 2) {
        let result = [];
        let start = center - range < 0 ? 0 : center - range;
        let end = center + range;
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    }

    iframe.onload = function () {
        // 点击
        iframe.contentDocument.addEventListener('mousedown', function (e) {
            startX = e.pageX;
            startY = e.pageY;
            isDragging = false;

            // 点击的高亮
            if (e.target.className == 'annotationBox'){
                // const customAnnoMenu = document.getElementById("customAnnoMenu");
                // customAnnoMenu.style.display = "block";
                // customAnnoMenu.style.left = startX + 'px';
                // customAnnoMenu.style.top = startY + 'px';
                //
                // const wrappers = document.querySelectorAll(".anno-wrapper");
                //
                // let colorFun = null
                // wrappers.forEach(wrapper => {
                //     wrapper.removeEventListener('click', colorFun, false);
                //     colorFun = function (event){
                //         const clickedWrapperId = event.currentTarget.id;
                //         console.log(clickedWrapperId)
                //         switch (clickedWrapperId){
                //             case "wrapper1" :
                //                 e.target.style.backgroundColor = 'rgb(255,62,68,0.5)';
                //                 break;
                //             case "wrapper2" :
                //                 e.target.style.backgroundColor = 'rgb(72,217,61,0.5)';
                //                 break;
                //             case "wrapper3" :
                //                 e.target.style.backgroundColor = 'rgb(12,250,230,0.5)';
                //                 break;
                //             case "wrapper4" :
                //                 e.target.style.backgroundColor = 'rgb(201,113,30,0.5)';
                //                 break;
                //             case "wrapper5" :
                //                 e.target.style.backgroundColor = 'rgb(158,0,250,0.5)';
                //                 break;
                //             default:
                //                 break;
                //         }
                //     }
                //     wrapper.addEventListener("click", colorFun, false);
                // });
                return;
            }

            // 只能记录左击
            if (e.button != 0) return

            pageNum = iframe.contentWindow.window.PDFViewerApplication.page;
            // console.log(pageNum)

            const canvas = iframe.contentDocument.getElementById('page'+iframe.contentWindow.window.PDFViewerApplication.page);
            const boundingRect = canvas.getBoundingClientRect();
            x = event.clientX - boundingRect.left;
            y = event.clientY - boundingRect.top;

            const myIframe = document.getElementById("myIframe");
            const iframeDocument = myIframe.contentDocument || myIframe.contentWindow.document;
            const viewer = iframeDocument.getElementById("viewer");
            const pages = Array.from(viewer.querySelectorAll("[data-page-number]"));
            const pageOne = pages.find(page => page.getAttribute("data-page-number") == pageNum);
            width = pageOne.clientWidth;
            height = pageOne.clientHeight;

            // if (width > x && x > 0 && height > y && y > 0) {
            //     x1 = x / width
            //     y1 = 1 - (y / height)
            //     console.log('页码：', pageNum)
            //     console.log("宽度:", width, "高度:", height);
            //     console.log('点击的坐标：', x, y)
            //     console.log('坐标比例：', x1, y1)
            // }

            // const offsetX = e.clientX
            // const offsetY = e.clientY
            // const boundingRect = e.target.getBoundingClientRect()
            // x = offsetX - boundingRect.left
            // y = offsetY - boundingRect.top
            // console.log('点击的坐标：', x, y) // 坐标原点改为右下角

            // 隐藏添加批注按钮
            const customContextMenu = document.getElementById("customContextMenu");
            customContextMenu.style.display = "none";
            const customDelMenu = document.getElementById("customDelMenu");
            customDelMenu.style.display = "none";
        }, true);

        // 滑动
        iframe.contentDocument.addEventListener('mousemove', function (e) {
            if (Math.abs(e.pageX - startX) > 5 || Math.abs(e.pageY - startY) > 5) {
                isDragging = true;
            }
        }, true);

        // 鼠标抬起监听
        iframe.contentDocument.addEventListener('mouseup', function (e) {
            // 没有滑动，排除
            if (!isDragging) return;

            const canvas = iframe.contentDocument.getElementById('page' + iframe.contentWindow.PDFViewerApplication.page);
            if (!canvas) {
                console.error('没有找到 Canvas');
                return;
            }
            const boundingRect = canvas.getBoundingClientRect();
            _x = e.clientX - boundingRect.left;
            _y = e.clientY - boundingRect.top;
            if (x == _x && y == _y) return;

            console.log('抬起的坐标：', _x, _y)

            const selection = iframe.contentWindow.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 相对于 canvas 的选中框坐标
            const lx = rect.left - boundingRect.left;
            const ly = rect.top - boundingRect.top;
            const rx = rect.right - boundingRect.left;
            const ry = rect.bottom - boundingRect.top;
            const bw = rect.width;
            const bh = rect.height;

            x1 = lx / width
            x2 = rx / width
            y1 = 1 - (ly / height)
            y2 = 1 - (ry / height)
            w = bw / width
            h = bh/ height

        }, true);

        // 鼠标右键监听
        let delFun = null
        iframe.contentDocument.addEventListener('contextmenu', function (e) {
            // 隐藏添加批注按钮
            const customContextMenu = document.getElementById("customContextMenu");
            customContextMenu.style.display = "none";
            const customDelMenu = document.getElementById("customDelMenu");
            customDelMenu.style.display = "none";

            e.preventDefault();
            let r_x = e.pageX;
            let r_y = e.pageY;
            let target = e.target;

            // 右击的评论
            // if (target.id == 'rightTextTitle') {
            if (target.id == 'rightTextTitle' || target.id == 'nameDiv' || target.id == 'timeDiv') {

                target = target.dataset.seq ? target : target.parentNode;

                let seq = target.dataset.seq
                let pageNum = target.dataset.pageNum

                var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                let drawLayerID = "drawLayer" + pageNum;
                let drawContainer = iframeDocument.getElementById(drawLayerID);

                // 在指定坐标显示自定义删除菜单
                const customDelMenu = document.getElementById("customDelMenu");
                customDelMenu.style.display = "block";
                customDelMenu.style.left = r_x + "px";
                customDelMenu.style.top = r_y + "px";

                // 定义删除功能
                const delAnnotationItem = document.getElementById("delAnnotation");
                delAnnotationItem.removeEventListener('click', delFun, false); // 确保移除旧的事件监听器
                delFun = function (e) {
                    let params = [{ name: 'seq', jsonValue: JSON.stringify(seq), type: 'eq', clazz: 'Long' }];
                    APP.ajax({
                        url: APP.docPrefix('sales/pdf/pdf-online/del'),
                        type: 'post',
                        data: { params: JSON.stringify(params) },
                        success: function (res) {
                            if (res.code == 0) {
                                layer.msg('删除成功');

                                //移除掉全局seq
                                pdfPageData = pdfPageData.filter(item => item.seq != seq);

                                let filter = pageAnnotations['page'+pageNum].filter(annotation => annotation.seq != seq);
                                pageAnnotations['page'+pageNum] = filter;

                                // 移除批注框
                                let annotationBoxID = 'annotationBox' + seq;
                                removeAnnotationBox(drawContainer, annotationBoxID);
                                // 移除目标元素的父元素
                                let parentDivToRemove = target.parentNode;
                                let grandParentDiv = parentDivToRemove.parentNode;
                                grandParentDiv.removeChild(parentDivToRemove);
                                // 隐藏删除菜单
                                customDelMenu.style.display = "none";
                            } else {
                                layer.msg('删除失败');
                            }
                        }
                    });
                }
                delAnnotationItem.addEventListener("click", delFun, false);
                return;
            }

            var selection = iframe.contentWindow.getSelection();
            var selectedText = selection.toString().trim();
            // 获取选中范围的矩形框
            var selectionRects = selection.getRangeAt(0).getClientRects();

            if (selectedText && selectionRects.length > 0) {
                const customContextMenu = document.getElementById("customContextMenu");
                customContextMenu.style.display = "block";
                customContextMenu.style.left = r_x + "px";
                customContextMenu.style.top = r_y + "px";
                const addAnnotationItem = document.getElementById("addAnnotation");
                addAnnotationItem.addEventListener("click", () => {
                    // 获取iframe里面的Element
                    let ID = "contents-" + pageNum;
                    var iframe = document.getElementById('myIframe');
                    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    var contentsContainer = iframeDocument.getElementById(ID);
                    let canvasID = "page" + pageNum;
                    var canvasContainer = iframeDocument.getElementById(canvasID);

                    // let className = ".page";
                    // var page = iframeDocument.querySelector(className);
                    // var height = page.offsetHeight;
                    var height = canvasContainer.offsetHeight;
                    var width = canvasContainer.offsetWidth;

                    // 添加批注了才设置样式
                    // contentsContainer.style.backgroundColor = '#FFFFFF'
                    // contentsContainer.style.hight = height + 'px !impotent'
                    // 计算批注框位置
                    let height_anno = height - (y1 * height);

                    if (!pageAnnotations['page' + pageNum]) {
                        pageAnnotations['page' + pageNum] = [];
                    }

                    // 批注
                    var annotationItem = document.createElement("div");
                    annotationItem.id = "rightText";
                    annotationItem.classList.add("righttext");
                    annotationItem.style.height = "70px";
                    annotationItem.style.width = '330px'
                    annotationItem.style.border = "1px solid gray";
                    annotationItem.style.borderRadius = "5px";

                    annotationItem.style.position = 'absolute'
                    annotationItem.style.top = height_anno+'px'

                    var titleDiv = document.createElement("div");
                    var nameDiv = document.createElement("div");
                    var timeDiv = document.createElement("div");
                    titleDiv.classList.add("rightTextTitle");
                    titleDiv.id = "rightTextTitle";
                    // 存储自定义属性
                    titleDiv.dataset.x1 = x1;
                    titleDiv.dataset.y1 = y1;
                    titleDiv.dataset.x2 = x2;
                    titleDiv.dataset.y2 = y2;
                    titleDiv.dataset.selectedText = selectedText;
                    titleDiv.dataset.pageNum = pageNum;

                    titleDiv.style.display = "flex";
                    titleDiv.style.justifyContent = "space-between";
                    nameDiv.textContent = "";
                    nameDiv.style.fontSize = "small";
                    nameDiv.style.textAlign = "left";
                    nameDiv.style.maxWidth = "50%";
                    nameDiv.style.whiteSpace = "nowrap";
                    nameDiv.style.overflow = "hidden";
                    nameDiv.style.textOverflow = "ellipsis";
                    nameDiv.id = "nameDiv";
                    timeDiv.id = "timeDiv";
                    timeDiv.textContent = "";
                    timeDiv.style.fontSize = "small";
                    timeDiv.style.textAlign = "right";
                    timeDiv.style.maxWidth = "50%";
                    timeDiv.style.whiteSpace = "nowrap";
                    timeDiv.style.overflow = "hidden";
                    timeDiv.style.textOverflow = "ellipsis";
                    titleDiv.appendChild(nameDiv)
                    titleDiv.appendChild(timeDiv)

                    var contentInput = document.createElement("textarea");
                    contentInput.classList.add("rightTextContent");
                    contentInput.style.height = "25px";
                    contentInput.style.resize = "none";
                    contentInput.style.border = "none";
                    // contentInput.placeholder = "输入批注内容";

                    annotationItem.appendChild(titleDiv);
                    annotationItem.appendChild(contentInput);
                    contentsContainer.appendChild(annotationItem);

                    contentInput.focus();
                    contentInput.addEventListener("blur", function() {
                        let contentText = contentInput.value.trim();
                        if (contentText === "") {
                            contentsContainer.removeChild(annotationItem);
                            layer.msg('未填写批注');
                            return;
                        }
                        const mdObj = {
                            pdfseq: pdfseq,
                            lx: x1,
                            ly: y1,
                            rx: x2,
                            ry: y2,
                            width: w,
                            height: h,
                            pageNum: pageNum,
                            pageText: selectedText,
                            contentText: contentText,
                        };
                        APP.ajax({
                            url: APP.docPrefix('sales/pdf/pdf-online/add'),
                            type: 'post',
                            data: { jsonObj: APP.toJson(mdObj) },
                            success: function success(res) {
                                if (res.code == 0) {
                                    layer.msg('添加成功');
                                    let data = res.data;

                                    //添加到全局
                                    pdfPageData.push(data)

                                    // 先移除，排序后重新渲染
                                    contentsContainer.removeChild(annotationItem);
                                    // 画框
                                    let drawLayerID = "drawLayer" + pageNum;
                                    var drawContainer = iframeDocument.getElementById(drawLayerID);
                                    var annotationBoxID = 'annotationBox'+data.seq
                                    var highlightX1 = x1 * width;
                                    var highlightY1 = height - (y1 * height);
                                    var highlightWidth = w * width
                                    var highlightHeight = h * height

                                    drawAnnotationBox(drawContainer, highlightX1, highlightY1, highlightWidth, highlightHeight, data.seq, contentText, data.staffName);

                                    let dataAnnotation = {
                                        seq: data.seq,
                                        lx: x1,
                                        ly: y1,
                                        contentText: contentText,
                                        pageText: selectedText,
                                        pageNum: pageNum,
                                    }
                                    pageAnnotations['page'+ pageNum].push(dataAnnotation);
                                    while (contentsContainer.firstChild) {
                                        contentsContainer.removeChild(contentsContainer.firstChild);
                                    }
                                    // 批注位置排序
                                    for (let page in pageAnnotations) {
                                        pageAnnotations[page].forEach(annotation => {
                                            // 只处理了xy，这个w和h可能有问题
                                            annotation.lx = annotation.lx <= 1 ? annotation.lx * width : annotation.lx;
                                            annotation.ly = annotation.ly <= 1 ? height - (annotation.ly * height) : annotation.ly;
                                            // annotation.lx *= width;
                                            // annotation.ly = height - (annotation.ly * height);
                                        });
                                        pageAnnotations[page].sort((a, b) => a.ly - b.ly);
                                        for (let i = 1; i < pageAnnotations[page].length; i++) {
                                            if (pageAnnotations[page][i].ly - pageAnnotations[page][i - 1].ly < 70) {
                                                pageAnnotations[page][i].ly = pageAnnotations[page][i - 1].ly + 75;
                                            }
                                        }
                                        pageAnnotations[page].sort((a, b) => {
                                            if (a.ly === b.ly) {
                                                return a.lx - b.lx;
                                            } else {
                                                return a.ly - b.ly;
                                            }
                                        });
                                    }
                                    // 批注
                                    for (var i = 0; i < pageAnnotations['page'+ pageNum].length; i++) {
                                        let v = pageAnnotations['page'+ pageNum][i];
                                        let ID = "contents-" + v.pageNum;
                                        let contentsContainer = iframeDocument.getElementById(ID);

                                        let annotationItem = document.createElement("div");
                                        annotationItem.id = "rightText";
                                        annotationItem.classList.add("righttext");
                                        annotationItem.style.height = "70px";
                                        annotationItem.style.width = '330px'
                                        annotationItem.style.border = "1px solid gray";
                                        annotationItem.style.borderRadius = "5px";
                                        annotationItem.style.position = 'absolute'
                                        annotationItem.style.top = v.ly + 'px'

                                        let titleDiv = document.createElement("div");
                                        var nameDiv = document.createElement("div");
                                        var timeDiv = document.createElement("div");
                                        titleDiv.classList.add("rightTextTitle");
                                        titleDiv.id = "rightTextTitle";
                                        // 存储自定义属性
                                        titleDiv.dataset.seq = v.seq ? v.seq : data.seq;
                                        titleDiv.dataset.x1 = v.lx;
                                        titleDiv.dataset.y1 = v.ly;
                                        titleDiv.dataset.x2 = v.rx;
                                        titleDiv.dataset.y2 = v.ry;
                                        titleDiv.dataset.selectedText = v.pageText;
                                        titleDiv.dataset.pageNum = v.pageNum;

                                        titleDiv.style.display = "flex";
                                        titleDiv.style.justifyContent = "space-between";
                                        nameDiv.textContent = v.staffName ? v.staffName : data.staffName;
                                        nameDiv.style.fontSize = "small";
                                        nameDiv.style.textAlign = "left";
                                        nameDiv.style.maxWidth = "50%";
                                        nameDiv.style.whiteSpace = "nowrap";
                                        nameDiv.style.overflow = "hidden";
                                        nameDiv.style.textOverflow = "ellipsis";
                                        nameDiv.id = "nameDiv";
                                        timeDiv.id = "timeDiv";
                                        timeDiv.textContent = v.createDatetime ? v.createDatetime : data.createDatetime;
                                        timeDiv.style.fontSize = "small";
                                        timeDiv.style.textAlign = "right";
                                        timeDiv.style.maxWidth = "50%";
                                        timeDiv.style.whiteSpace = "nowrap";
                                        timeDiv.style.overflow = "hidden";
                                        timeDiv.style.textOverflow = "ellipsis";
                                        titleDiv.appendChild(nameDiv)
                                        titleDiv.appendChild(timeDiv)

                                        let contentInput = document.createElement("textarea");
                                        contentInput.classList.add("rightTextContent");
                                        contentInput.dataset.seq = v.seq ? v.seq : data.seq;
                                        contentInput.value = v.contentText;
                                        contentInput.style.height = "25px";
                                        contentInput.style.resize = "none";
                                        contentInput.style.border = "none";

                                        annotationItem.appendChild(titleDiv);
                                        annotationItem.appendChild(contentInput);
                                        contentsContainer.appendChild(annotationItem);
                                    }

                                    addRightEventListener()
                                }
                            }
                        })
                    });
                    // 隐藏添加批注按钮
                    customContextMenu.style.display = "none";
                });
            } else {
                console.log("没有选择文本或右击位置不在选择文本范围内");
            }
            e.preventDefault();
        }, true);

        // 动态加载
        iframe.contentDocument.addEventListener('wheel', function(event) {
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            let page_num = parseInt(iframeDocument.getElementById('page_num').value, 10);
            let rangeArray = createRangeArray(page_num);
            dynamicLoadAna(rangeArray)
        });

    }

    // 发送数据(搜索文字)
    function sendMessage(selectText, selectPage) {
        iframe.contentWindow.postMessage({ selectText: selectText, pageIndex: selectPage }, '*');
    }
    // 监听接受数据
    function getMessage() {
        let iframe = document.getElementById('myIframe');
        iframe.contentWindow.addEventListener('message', function (e) {
            console.log("接收到的文字: " + JSON.stringify(e.data));
            console.log(iframe.contentWindow.PDFViewerApplication.findBar);

            iframe.contentWindow.PDFViewerApplication.findBar.findField.value = e.data.selectText;
            iframe.contentWindow.PDFViewerApplication.findBar.highlightAll.checked = true;
            let event = new Event('highlightallchange');
            iframe.contentWindow.PDFViewerApplication.findBar.dispatchEvent(event);
            if (e.data.pageIndex) {
                iframe.contentWindow.PDFViewerApplication.pdfViewer.currentPageNumber = e.data.pageIndex;
            }
        }, true);
    }

    $('#searchBtn').on('click', function() {
        var inputText = $('#inputText').val();
        if (inputText) {
            sendMessage(inputText, 1);
        } else {
            layer.msg('请输入搜索文本');
        }
    });

    $('#downloadBtn').on('click', function() {
        if (pdfseq){
            const link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            const url = `/sales/pdf/pdf-online/down?pk=${pdfseq}`;
            link.setAttribute('href', url);
            link.setAttribute('download', pdffilename);
            link.click();
            document.body.removeChild(link);
            layer.msg('下载成功');
        }else {
            layer.msg('没有附件提供下载');
        }
    })

    $('#uploadBtn').on('click', function() {
        let ID = "PDF";
        let FORM_DATA_ID = "FORM_DATA_"+ID
        let LAYER_ID_ID = "LAYER_ID_"+ID
        let DATA_TABLE_STU = `dataTableStu-${ID}`
        layer.open({
            type: 1
            , title: `上传PDF`
            , id: LAYER_ID_ID
            , area: APP.isWAP() ? ['90%', '100%'] : ['860px','100%']
            , skin: 'layui-layer-green p-0'
            , scrollbar: false
            , resize: false
            , offset: 't'
            , closeBtn: 1
            , content:
                `
                    <div class="layui-form" style="padding: 10px 20px">
                        <div class="m-b-5"></div>
                        <button id="dataTableUpload-${ID}" lay-submit lay-filter="dataTableUpload-${ID}" type="button" class="layui-btn" >上 传</button>
                        <button id="dataTableDel-${ID}" lay-submit lay-filter="dataTableDel-${ID}" type="button" class="layui-btn" >删 除</button>
                    </div>
                    <form class="layer-form layui-form" lay-filter="${FORM_DATA_ID}">
                        <div class="layer-body" >
                            <table id="dataTableStu-${ID}" lay-filter="dataTableStu-${ID}"></table>
                        </div>
                    </form>
                `
            , success: (layero, index) => {
                // 上传
                form.on(`submit(dataTableUpload-${ID})`,(obj)=>{
                    let uploadBtn = $('<input type="file" data-id="55"/>');
                    uploadBtn.off('change').on('change', function () {
                        let file = this.files[0];
                        if (!/\.pdf?$/.test(this.value)) {
                            APP.tips('请上传 .pdf 格式的文档');
                            return;
                        }
                        let formData = new FormData()
                            , fileName = file.name
                            , fileSize = file.size;
                        formData.append('file', file);
                        let httpUrl = APP.filePrefix('/file_server/upload/') + '?'
                            + 'tenant_id' + '=' + APP.getEncodeURI(tenantId)
                            + '&user_id' + '=' + APP.getEncodeURI(userId)
                            + '&sys_file_upload_config_seq=41';
                        APP.ajaxUploadAndProgress({
                            url: httpUrl
                            ,data: formData
                            ,file: file
                            ,autoCloseProgress: true
                            ,success(res, progressIdx){
                                if (res.code == 0) {
                                    let data = {};
                                    data.fileurl = res.data.httpUrl;
                                    data.filehash = res.data.fileHash;
                                    data.filesize = res.data.fileSize;
                                    data.filename = res.data.fileName;
                                    APP.ajax({
                                        url: '/sales/pdf/add'
                                        , data: {jsonObj: JSON.stringify(data)}
                                        , type: 'post'
                                        , success: res => {
                                            if (res.code == 0) {
                                                table.reload(`dataTableStu-${ID}`);
                                            }
                                            layer.msg(res.msg);
                                        }
                                    })
                                    layer.msg('已上传成功');
                                } else {
                                    APP.tips(res.msg);
                                }
                            }
                        })
                    });
                    uploadBtn.trigger('click');
                });
                // 删除
                form.on(`submit(dataTableDel-${ID})`,(obj)=>{
                    layer.open({
                        type: 1
                        , title: '删除PDF'
                        , id: 'LAYER-ID-EXPORT'
                        , area: APP.isWAP() ? '90%' : '460px'
                        , skin: 'layui-layer-green layer-overflow-initial'
                        , anim: 5
                        , scrollbar: false
                        , resize: false
                        , closeBtn:1
                        , content:
                            `
                            <div class="layui-form layui-form-pane" lay-filter="LAYER-FORMDATA-ID-EXPORT">
                                <div class="layui-form-item">
                                    <label class="layui-form-label">删除PDF</label>
                                    <div class="layui-input-inline">
                                        <select name="exportType">
                                            <option value="1">已选择数据</option>
                                            <option value="2">当前条件数据</option>
                                        </select>
                                    </div>
                                    <button  type="button" lay-submit lay-filter="LAYER-FORMDATA-ID-EXPORT" class="layui-btn">开始删除</button>
                                </div>
                            </div>
                            `
                        ,success: function(layero, index){
                            form.render('select');
                            form.on('submit(LAYER-FORMDATA-ID-EXPORT)', obj => {
                                layer.confirm(
                                    `<p>清除分析记录</p>
                                     <p class="p-t-10">执行后不可恢复，是否执行？</p>`
                                    , {area: APP.isWAP() ? '90%' : '440px', title:'操作提示'}, (j, layero) =>{
                                        layer.close(j);
                                        let exportType = obj.field.exportType * 1;
                                        let pageObj = {page: dataTableFX.page.curr||1, limit:dataTableFX.page.limit};
                                        let currDataTableCache
                                        if(!(currDataTableCache = APP.getObjKeysVal(layui.table.cache, 'dataTableStu-PDF')) || currDataTableCache.length === 0) {
                                            layer.msg('没有数据可以删除');
                                            return;
                                        }
                                        let params = JSON.parse(dataTableFX.where.params);
                                        if(exportType === 1){
                                            let checkStatus = table.checkStatus('dataTableStu-PDF');
                                            if (checkStatus.data.length > 0) {
                                                let jsonIds = [];
                                                $.each(checkStatus.data, function (i, item) {
                                                    if (item.seq) {
                                                        jsonIds.push(item.seq);
                                                    }
                                                });
                                                params.push({name:'seq', columnName:'seq', jsonValue:APP.toJson(jsonIds), type:'in', clazz:'Long'})
                                                pageObj.params = JSON.stringify(params);
                                            }
                                            else {
                                                layer.msg('请选择需要删除的数据');
                                                return;
                                            }
                                        }
                                        else {
                                            pageObj.params = JSON.stringify(params);
                                        }
                                        if (params.length == 0){
                                            layer.msg("请选择条件");
                                            return;
                                        }
                                        layer.load(1, {time:5000});
                                        layer.msg('正在删除数据，请稍后...');
                                        APP.ajax({
                                            url: "/sales/pdf/del"
                                            ,type:'post'
                                            ,data: $.extend({}, dataTableFX.where, pageObj)
                                            ,success: (res)=>{
                                                if(res.code == 0){
                                                    table.reload('dataTableStu-PDF')
                                                    layer.close(index);
                                                }
                                                layer.msg(res.msg);
                                            }
                                        })
                                    });
                            });
                        }
                    });
                    return false
                })
                // 加载
                table.render({
                    elem: '#'+DATA_TABLE_STU
                    , url: '/sales/pdf/list'
                    , where: { params: APP.buildReqParamsToJson({})}
                    , headers:APP.getHeaders()
                    , method: 'POST'
                    , limit: 20
                    , limits: APP.limits
                    , page: true
                    , cols: [[
                        { fixed: APP.isWAP() ? '' : 'left', type: 'checkbox', width: 50 }
                        , { fixed: APP.isWAP() ? '' : 'left', width: 90, title: '预览批注', templet(d){
                                return '<div> <a class="link-green" lay-event="preview">批注</a> '
                            }
                        },
                        { fixed: '',  field: '', title: '附件', width: 60, templet(d){
                                let downloadIconColor = d.fileurl ? 'color-blue' : 'color-gray';
                                return `<a lay-event="download" title="${d.filename}"><i class="iconfont icon-xiazai ${downloadIconColor} icon-hover" style="font-weight: bolder;"></i></a>`;
                            }}
                        , { fixed: '',  field: '', title: '批注', width: 60, templet(d){
                                let downloadIconColor = d.fileurl ? 'color-blue' : 'color-gray';
                                return `<a lay-event="download2" title="${d.filename}"><i class="iconfont icon-xiazai ${downloadIconColor} icon-hover" style="font-weight: bolder;"></i></a>`;
                            }}
                        , {field: 'filename', title:'文件名称', width:200}
                        , {field: 'fileurl', title:'文件url', minwidth:200}
                    ]]
                    , done: function (res) {
                        dataTableFX = this
                    }
                });
                // 修改编辑
                table.on('tool(dataTableStu-PDF)', obj => {
                    var data = obj.data
                        , evt = obj.event ;
                    if ('preview' === evt){
                        pdfseq = data.seq
                        pdffileurl = data.fileurl
                        pdffilename = data.filename
                        var iframe = document.getElementById("myIframe");
                        iframe.src = "/assets/page/sale/admin/pdfView/pdf/web/viewer.html?file=" + data.fileurl;
                        layer.close(index);
                        // 加载批注
                        getAnnotation(pdfseq)
                    }else if ('download' === evt){
                        let fileurl = data.fileurl;
                        if (fileurl) {
                            APP.downloadExistFile({url: fileurl, fileName: data.filename})
                        }else {
                            layer.msg('没有附件提供下载');
                        }
                    }else if ('download2' === evt){
                        pdfseq = data.seq
                        pdffileurl = data.fileurl
                        pdffilename = data.filename
                        if (pdfseq) {
                            const link = document.createElement('a');
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            const url = `/sales/pdf/pdf-online/down?pk=${pdfseq}`;
                            link.setAttribute('href', url);
                            link.setAttribute('download', pdffilename);
                            link.click();
                            document.body.removeChild(link);
                            layer.msg('下载成功');
                        }else {
                            layer.msg('没有附件提供下载');
                        }
                    }
                });
            }
        });
        return false
    })

    $('#showAnnotationBtn').on('click', function() {
        if (!pdfseq) {
            layer.msg("未选择PDF")
            return false
        }
        let ID = "showAnnotation";
        let FORM_DATA_ID = "FORM_DATA_"+ID
        let LAYER_ID_ID = "LAYER_ID_"+ID
        let DATA_TABLE_STU = `dataTableStu-${ID}`
        layer.open({
            type: 1
            , title: `批注管理`
            , id: LAYER_ID_ID
            , area: APP.isWAP() ? ['90%', '100%'] : ['860px','100%']
            , skin: 'layui-layer-green p-0'
            , scrollbar: false
            , resize: false
            , offset: 't'
            , closeBtn: 1
            , content:
                `
                    <div class="layui-form" style="padding: 10px 20px">
                        <div class="m-b-5"></div>
                        <button id="dataTableDel-${ID}" lay-submit lay-filter="dataTableDel-${ID}" type="button" class="layui-btn" >删 除</button>
                    </div>
                    <form class="layer-form layui-form" lay-filter="${FORM_DATA_ID}">
                        <div class="layer-body" >
                            <table id="dataTableStu-${ID}" lay-filter="dataTableStu-${ID}"></table>
                        </div>
                    </form>
                `
            , success: (layero, i1) => {
                // 删除
                form.on(`submit(dataTableDel-${ID})`,(obj)=>{
                    layer.open({
                        type: 1
                        , title: '删除PDF批注'
                        , id: 'LAYER-ID-EXPORT'
                        , area: APP.isWAP() ? '90%' : '460px'
                        , skin: 'layui-layer-green layer-overflow-initial'
                        , anim: 5
                        , scrollbar: false
                        , resize: false
                        , closeBtn:1
                        , content:
                            `
                            <div class="layui-form layui-form-pane" lay-filter="LAYER-FORMDATA-ID-EXPORT">
                                <div class="layui-form-item">
                                    <label class="layui-form-label">删除批注</label>
                                    <div class="layui-input-inline">
                                        <select name="exportType">
                                            <option value="1">已选择数据</option>
                                            <option value="2">当前条件数据</option>
                                        </select>
                                    </div>
                                    <button  type="button" lay-submit lay-filter="LAYER-FORMDATA-ID-EXPORT" class="layui-btn">开始删除</button>
                                </div>
                            </div>
                            `
                        ,success: function(layero, i2){
                            form.render('select');
                            form.on('submit(LAYER-FORMDATA-ID-EXPORT)', obj => {
                                layer.confirm(
                                    `<p>清除分析记录</p>
                                     <p class="p-t-10">执行后不可恢复，是否执行？</p>`
                                    , {area: APP.isWAP() ? '90%' : '440px', title:'操作提示'}, (j, layero) =>{
                                        layer.close(j);
                                        let exportType = obj.field.exportType * 1;
                                        let pageObj = {page: dataTableFX.page.curr||1, limit:dataTableFX.page.limit};
                                        let currDataTableCache
                                        if(!(currDataTableCache = APP.getObjKeysVal(layui.table.cache, 'dataTableStu-showAnnotation')) || currDataTableCache.length === 0) {
                                            layer.msg('没有数据可以删除');
                                            return;
                                        }
                                        let params = JSON.parse(dataTableFX.where.params);
                                        if(exportType === 1){
                                            let checkStatus = table.checkStatus('dataTableStu-showAnnotation');
                                            if (checkStatus.data.length > 0) {
                                                let jsonIds = [];
                                                $.each(checkStatus.data, function (i, item) {
                                                    if (item.seq) {
                                                        jsonIds.push(item.seq);
                                                    }
                                                });
                                                params.push({name:'seq', columnName:'seq', jsonValue:APP.toJson(jsonIds), type:'in', clazz:'Long'})
                                                pageObj.params = JSON.stringify(params);
                                            }
                                            else {
                                                layer.msg('请选择需要删除的数据');
                                                return;
                                            }
                                        }
                                        else {
                                            pageObj.params = JSON.stringify(params);
                                        }
                                        if (params.length == 0){
                                            layer.msg("请选择条件");
                                            return;
                                        }
                                        layer.load(1, {time:5000});
                                        layer.msg('正在删除数据，请稍后...');
                                        APP.ajax({
                                            url: "/sales/pdf/pdf-online/del"
                                            ,type:'post'
                                            ,data: $.extend({}, dataTableFX.where, pageObj)
                                            ,success: (res)=>{
                                                if(res.code == 0){
                                                    table.reload('dataTableStu-showAnnotation')
                                                    layer.close(i1);
                                                    layer.close(i2);
                                                    var iframe = document.getElementById("myIframe");
                                                    iframe.src = "/assets/page/sale/admin/pdfView/pdf/web/viewer.html?file=" + pdffileurl;
                                                    getAnnotation(pdfseq)
                                                }
                                                layer.msg(res.msg);
                                            }
                                        })
                                    });
                            });
                        }
                    });
                    return false
                })
                // 加载
                table.render({
                    elem: '#'+DATA_TABLE_STU
                    , url: APP.accountPrefix('sales/pdf/pdf-online/list')
                    , where: { params: APP.buildReqParamsToJson({pdfseq: pdfseq})}
                    , method: 'POST'
                    , cols: [[
                        { fixed: APP.isWAP() ? '' : 'left', type: 'checkbox', width: 50 }
                        , {field: 'staffName', title:'作者', width:100}
                        , {field: 'pageText', title:'选择文本', width:200}
                        , {field: 'contentText', title:'批注文本', width:200}
                        , {field: 'createDatetime', title:'创建日期', width:200}
                        , {field: 'updateDatetime', title:'修改日期', width:200}
                    ]]
                    , done: function (res) {
                        dataTableAna = this
                    }
                });
                // 修改编辑
                table.on('tool(dataTableStu-PDF)', obj => {
                    var data = obj.data
                        , evt = obj.event ;
                    if ('preview' === evt){
                        pdfseq = data.seq
                        pdffileurl = data.fileurl
                        pdffilename = data.filename
                    }
                });
            }
        });
        return false
    })

    // rightTextTitle 鼠标悬浮事件
    let changeFun = function(e) {
        let field = {};
        let seq = e.target.dataset.seq;
        let contentText = e.target.value
        field.contentText = contentText;
        let _params = APP.buildReqParams(field);
        APP.ajax({
            url: '/sales/pdf/pdf-online/update',
            type: 'post',
            data: { pk: seq, params: JSON.stringify(_params) },
            success(res) {
                layer.msg(res.msg);
                var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                let btnText = iframeDocument.getElementById(seq);
                btnText.innerText = contentText;
            }
        });
    };
    function addRightEventListener() {
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        let rightTextTitleClass = "rightTextTitle";
        let rightTextTitleContainers = iframeDocument.getElementsByClassName(rightTextTitleClass);
        Array.from(rightTextTitleContainers).forEach(rightContainer => {
            rightContainer.addEventListener("mouseenter", (e) => {
                let seq = e.target.dataset.seq;
                let annotationBoxID = 'annotationBox' + seq;
                let annotationBox = iframeDocument.getElementById(annotationBoxID);
                if (annotationBox) {
                    annotationBox.style.backgroundColor = 'rgba(246,157,157,0.5)';
                    annotationBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
                    e.target.parentElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
                }
            });
            rightContainer.addEventListener("mouseleave", (e) => {
                let seq = e.target.dataset.seq;
                let annotationBoxID = 'annotationBox' + seq;
                let annotationBox = iframeDocument.getElementById(annotationBoxID);
                if (annotationBox) {
                    annotationBox.style.backgroundColor = 'rgba(171,246,157,0.5)';
                    annotationBox.style.boxShadow = 'none';
                    e.target.parentElement.style.boxShadow = 'none';
                }
            });
        });

        let rightTextContentClass = "rightTextContent";
        let rightTextContents = iframeDocument.getElementsByClassName(rightTextContentClass);
        for (let i = 0; i < rightTextContents.length; i++) {
            rightTextContents[i].removeEventListener('change', changeFun, false);
            rightTextContents[i].addEventListener('change', changeFun, false);
        }
    }

    // 批注高亮
    function drawAnnotationBox(drawLayerDiv, x, y, width, height, seq, contentText, staffName) {
        var annotationBoxID = 'annotationBox'+seq
        var annotationBox = document.createElement('div');
        annotationBox.className = 'annotationBox';
        annotationBox.id = annotationBoxID;
        annotationBox.style.position = 'absolute';
        annotationBox.style.left = x + 'px';
        annotationBox.style.top = y + 'px';
        annotationBox.style.width = width + 'px';
        annotationBox.style.height = height + 'px';
        annotationBox.style.backgroundColor = 'rgb(171,246,157,0.5)';
        annotationBox.style.zIndex = '99';
        annotationBox.style.cursor = 'pointer';

        var tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.border = '1px solid black';
        tooltip.style.padding = '5px';
        tooltip.style.display = 'none';
        tooltip.style.width = '100%';
        tooltip.style.maxWidth = '200px';

        var topDiv = document.createElement('div');
        topDiv.textContent = staffName
        topDiv.style.wordBreak = 'break-all';

        var bottomDiv = document.createElement('div');
        bottomDiv.id = seq
        bottomDiv.textContent = contentText
        bottomDiv.style.wordBreak = 'break-all';

        tooltip.appendChild(topDiv);
        tooltip.appendChild(bottomDiv);

        // 事件监听器
        annotationBox.addEventListener('mouseover', function(event) {
            tooltip.style.display = 'block';
            tooltip.style.marginTop = height + 'px';
            tooltip.style.marginLeft = width + 'px';
        });
        annotationBox.addEventListener('mouseout', function() {
            tooltip.style.display = 'none';
        });
        annotationBox.appendChild(tooltip);
        drawLayerDiv.appendChild(annotationBox);
    }
    function removeAnnotationBox(drawLayerDiv, id) {
        var iframe = document.getElementById('myIframe');
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var annotationBox = iframeDocument.getElementById(id);
        if (annotationBox && annotationBox.parentNode === drawLayerDiv) {
            drawLayerDiv.removeChild(annotationBox);
        }
    }

    // 加载批注
    function getAnnotation(pdfSeq){
        // 默认pdf
        if (!pdfSeq){
            return
            var iframe = document.getElementById("myIframe");
            iframe.src = "/assets/page/sale/admin/pdfView/pdf/web/viewer.html?file=/assets/page/sale/admin/pdfs/1.pdf";
        }
        APP.ajax({
            url: APP.accountPrefix('sales/pdf/pdf-online/list')
            , method: 'post'
            , data: {params: APP.buildReqParamsToJson({pdfseq: pdfSeq}), isPage: false }
            , async: false
            , success: res => {
                if (res.code == 0) {
                    setTimeout(function() {
                        pdfPageData = res.data;
                        let rangeArray = [1]
                        dynamicLoadAna(rangeArray)
                    }, 2000);
                }
            }
        })
    }
    function dynamicLoadAna(rangeArray){
        pageAnnotations = {}
        var iframe = document.getElementById('myIframe');
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        let highlightX1
        let highlightY1
        let highlightWidth
        let highlightHeight

        let pdfPageDataCopy = JSON.parse(JSON.stringify(pdfPageData));
        let filteredData = pdfPageDataCopy.filter(item => rangeArray.includes(item.pageNum));

        for (var i = 0; i < filteredData.length; i++) {
            var dataAnnotation = filteredData[i];
            // 获取iframe里面的Element
            let ID = "contents-" + dataAnnotation.pageNum;
            let canvasID = "page" + dataAnnotation.pageNum;
            let drawLayerID = "drawLayer" + dataAnnotation.pageNum;

            // var contentsContainer = iframeDocument.getElementById(ID);
            var canvasContainer = iframeDocument.getElementById(canvasID);
            var drawContainer = iframeDocument.getElementById(drawLayerID);

            var height = canvasContainer.offsetHeight;
            var width = canvasContainer.offsetWidth;

            if (!pageAnnotations['page' + dataAnnotation.pageNum]) {
                pageAnnotations['page' + dataAnnotation.pageNum] = [];
            }
            pageAnnotations['page' + dataAnnotation.pageNum].push(dataAnnotation);

            let annotationBoxID = "annotationBox" + dataAnnotation.seq;
            var annotationBoxIdDiv = iframeDocument.getElementById(annotationBoxID);
            if (annotationBoxIdDiv){
                continue;
            }

            highlightX1 = dataAnnotation.lx * width;
            highlightY1 = height - (dataAnnotation.ly * height);
            highlightWidth = dataAnnotation.width * width
            highlightHeight = dataAnnotation.height * height

            drawAnnotationBox(drawContainer, highlightX1, highlightY1, highlightWidth, highlightHeight, dataAnnotation.seq, dataAnnotation.contentText, dataAnnotation.staffName);
        }
        // 批注位置排序
        for (let page in pageAnnotations) {
            pageAnnotations[page].forEach(annotation => {
                // 只处理了xy，这个w和h可能有问题
                annotation.lx = annotation.lx <= 1 ? annotation.lx * width : annotation.lx;
                annotation.ly = annotation.ly <= 1 ? height - (annotation.ly * height) : annotation.ly;
            });
            pageAnnotations[page].sort((a, b) => a.ly - b.ly);
            for (let i = 1; i < pageAnnotations[page].length; i++) {
                if (pageAnnotations[page][i].ly - pageAnnotations[page][i - 1].ly < 70) {
                    pageAnnotations[page][i].ly = pageAnnotations[page][i - 1].ly + 75;
                }
            }
            pageAnnotations[page].sort((a, b) => {
                if (a.ly === b.ly) {
                    return a.lx - b.lx;
                } else {
                    return a.ly - b.ly;
                }
            });
        }
        // 批注
        for (let page in pageAnnotations) {
            for (var i = 0; i < pageAnnotations[page].length; i++) {
                let v = pageAnnotations[page][i];
                let ID = "contents-" + v.pageNum;
                var contentsContainer = iframeDocument.getElementById(ID);

                var rightTextDivs = contentsContainer.querySelectorAll("#rightText");
                var numberOfDivs = rightTextDivs.length;

                const page_len = pdfPageData.filter(page => page.pageNum == v.pageNum).length;
                if (page_len<=numberOfDivs){
                    continue
                }

                var annotationItem = document.createElement("div");
                annotationItem.id = "rightText";
                annotationItem.classList.add("righttext");
                annotationItem.style.height = "70px";
                annotationItem.style.width = '330px'
                annotationItem.style.border = "1px solid gray";
                annotationItem.style.borderRadius = "5px";
                annotationItem.style.position = 'absolute'
                annotationItem.style.top = v.ly+'px'

                var titleDiv = document.createElement("div");
                var nameDiv = document.createElement("div");
                var timeDiv = document.createElement("div");
                titleDiv.classList.add("rightTextTitle");
                titleDiv.id = "rightTextTitle";
                // 存储自定义属性
                titleDiv.dataset.seq = v.seq;
                titleDiv.dataset.x1 = v.lx;
                titleDiv.dataset.y1 = v.ly;
                titleDiv.dataset.x2 = v.rx;
                titleDiv.dataset.y2 = v.ry;
                titleDiv.dataset.selectedText = v.pageText;
                titleDiv.dataset.contentText = v.contentText;
                titleDiv.dataset.pageNum = v.pageNum;
                titleDiv.dataset.highlightX1 = highlightX1
                titleDiv.dataset.highlightY1 = highlightY1
                titleDiv.dataset.highlightWidth = highlightWidth
                titleDiv.dataset.highlightHeight = highlightHeight
                titleDiv.dataset.staffName = v.staffName;
                titleDiv.dataset.createDatetime = v.createDatetime

                titleDiv.style.display = "flex";
                titleDiv.style.justifyContent = "space-between";
                nameDiv.textContent = v.staffName;
                nameDiv.style.fontSize = "small";
                nameDiv.style.textAlign = "left";
                nameDiv.style.maxWidth = "50%";
                nameDiv.style.whiteSpace = "nowrap";
                nameDiv.style.overflow = "hidden";
                nameDiv.style.textOverflow = "ellipsis";
                nameDiv.id = "nameDiv";
                timeDiv.id = "timeDiv";
                timeDiv.textContent = v.createDatetime;
                timeDiv.style.fontSize = "small";
                timeDiv.style.textAlign = "right";
                timeDiv.style.maxWidth = "50%";
                timeDiv.style.whiteSpace = "nowrap";
                timeDiv.style.overflow = "hidden";
                timeDiv.style.textOverflow = "ellipsis";
                titleDiv.appendChild(nameDiv)
                titleDiv.appendChild(timeDiv)

                var contentInput = document.createElement("textarea");
                contentInput.classList.add("rightTextContent");
                contentInput.dataset.seq = v.seq;
                contentInput.value = v.contentText;
                contentInput.style.height = "25px";
                contentInput.style.resize = "none";
                contentInput.style.border = "none";

                annotationItem.appendChild(titleDiv);
                annotationItem.appendChild(contentInput);
                contentsContainer.appendChild(annotationItem);
            }
        }
        addRightEventListener()
    }

    function initPdf(){
        getMessage()
        getAnnotation()
    }

    initPdf()

})();
