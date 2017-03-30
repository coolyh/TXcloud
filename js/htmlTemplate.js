
function fileConstruct(data){
	var str = `
		<div class="item" data-file-id="${data.id}">
            <lable class="checkbox"></lable>
            <div class="file-img">
                <i></i>
            </div>
            <p class="file-title-box">
                <span class="file-title">${data.title}</span>
                <span class="file-edtor">
                    <input class="edtor" value="${data.title}" type="text"/>
                </span>
            </p>
        </div>
	`;

	return str;
}


/*
*准备文件区域的html结构
*/

function filesHtml(data){
	var fileHtml = `
					<div class="file-item">
                        ${fileConstruct(data)}
                    </div>
					`;
	return fileHtml;
}



/*
*准备treeMeun的html结构
*/
function treeHtml(data,treeId){

	var childs = dataControl.getChildById(data,treeId);
	
	var html = "<ul>";
	childs.forEach(function(item){
		//获取当前数据的层级 通过id获取 使用dataControl.getLevelById(data,id)方法
		var level = dataControl.getLevelById(data,item.id);
		//tree-nav tree-contro
		//
		//判断这个id是否有子元素？？？
		var hasChild = dataControl.hasChilds(data,item.id);
		var classNames = hasChild ? "tree-contro" : "tree-contro-none";
		html += `
                <li>
                    <div class="tree-title ${classNames}" data-file-id="${item.id}" style="padding-left:${level*14}px">
                        <span>
                            <strong class="ellipsis">${item.title}</strong>
                            <i class="ico"></i>
                        </span>
                    </div>
                    ${treeHtml(data,item.id)}
                </li>
				`;
	});
	html += "</ul>"
	
	return html;
}
//创建文件时，创建一个树形菜单的li
function createTreeHtml(options){
	var newLi = document.createElement("li");
	newLi.innerHTML = `
		<div class="tree-title tree-contro-none" data-file-id="${options.id}" style="padding-left:${options.level*14}px">
            <span>
                <strong class="ellipsis">${options.title}</strong>
                <i class="ico"></i>
            </span>
        </div>
        <ul></ul>
	`;
	return newLi;
}



//点击新建文件的时候，返回一个div元素对象
function createFileElement(data){
	var newDiv = document.createElement("div");
	newDiv.className = "file-item";
	newDiv.innerHTML = fileConstruct(data);
	return newDiv;
}


//通过ID定位到树形菜单
function positionTreeById(positionId){
		var ele = document.querySelector(".tree-title[data-file-id='"+positionId+"']");
		tools.addClass(ele,"tree-nav");
}

//通过id得到当前这个id所有的父数据  ，得到一个结构
function createPathNavHtml(datas,fileId){
	//找到指定id所有父数据
	var parents = dataControl.getParents(datas,fileId).reverse();
	var pathNavHtml = "";
	var len = parents.length;
	parents.forEach(function(item,index){
		if( index === parents.length-1 ){
			return;
		}
		pathNavHtml += `
			<a href="javascript:;" style="z-index:${len--}" data-file-id="${item.id}">${item.title}</a>	
		`;
	});
	pathNavHtml += `
		<span class="current-path" style="z-index:${len--}" data-file-id="0">${parents[parents.length-1].title}</span>
	`;
	return pathNavHtml;
}