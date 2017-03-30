(function(){
	/*
	* 获取下方可视区域
	*/
	var header = tools.$(".header")[0];
	var weiyunContent = tools.$(".weiyun-content")[0];	
	var headerH = header.offsetHeight;

	changeHeight()
	function changeHeight(){
		var viewHeight = document.documentElement.clientHeight;
		weiyunContent.style.height = viewHeight - headerH + "px";
	}
	
	window.onresize = changeHeight;

	/*
	* 获取数据
	*/
	var datas = data.files;

	/*
	* 渲染文件区域
	*/
	var renderId = 0;//默认开始要渲染id下的所以子数据

	var fileLise = tools.$(".file-list")[0];//文件区域容器

	var getPidInput = tools.$("#getPidInput");

	//返回指定id下所有子数据的html结构
	function createFilesHtml(data,renderId){
		var childs = dataControl.getChildById(data,renderId);
		var html = "";
		childs.forEach(function(item){
			html += filesHtml(item);
		});
		return html;
	}
	fileLise.innerHTML = createFilesHtml(datas,0);

	//利用事件冒泡，点击每一个文件夹
	tools.addEvent(fileLise,"click",function(e){
		var target = e.target;
		if( tools.parents(target,".item") ){
			target = tools.parents(target,".item");
			var  fileId = target.dataset.fileId;

			renderNavFilesTree(fileId);
		}
	});



	/*
	* 渲染菜单区域
	*/
	var treeMeun = tools.$(".tree-menu")[0];//菜单区域容器

	var pathNav = tools.$(".path-nav")[0];//文件导航区域容器

	//利用事件冒泡，点击文件导航的区域
	tools.addEvent(pathNav,"click",function(e){
		var target = e.target;
		if( tools.parents(target,"a") ){
			target = tools.parents(target,"a");
			//找到div身上的id
			var fileId = target.dataset.fileId;
			
			renderNavFilesTree(fileId);
		}
	});

	var empty = tools.$(".g-empty")[0];

	treeMeun.innerHTML = treeHtml(datas,-1);//初始 渲染文件树菜单区域
	pathNav.innerHTML = createPathNavHtml(datas,0);//初始 渲染文件导航区域

	positionTreeById(0);//定位到属性菜单上面  

	//利用事件冒泡，点击树形菜单的区域，找到事件源就可以
	tools.addEvent(treeMeun,"click",function(e){
		var target = e.target; 

		if( tools.parents(target,".tree-title") ){
			target = tools.parents(target,".tree-title");
			//找到div身上的id
			var fileId = target.dataset.fileId;
			
			renderNavFilesTree(fileId);
		}
	});
	
	//通过指定的id渲染文件区域，文件导航区域，树形菜单
	function renderNavFilesTree(fileId){
			//渲染文件导航区域
			pathNav.innerHTML = createPathNavHtml(datas,fileId);

			// 如果指定的id没有子数据，需要显示“没有数据”
			var hasChild = dataControl.hasChilds(datas,fileId);
			if ( hasChild ) {//如果有子数据
				empty.style.display = "none";
				//找到当前这个id下所有的子数据，渲染在文件区域中
				fileLise.innerHTML = createFilesHtml(datas,fileId);
			}else{
				empty.style.display = "block";
				fileLise.innerHTML = "";
			}
			
			//需要给点击的div添加点击样式，其余的没有
			var treeNav = tools.$(".tree-nav",treeMeun)[0];
			tools.removeClass(treeNav,"tree-nav");
			positionTreeById(fileId);

			//通过隐藏域记录一下当前操作的pid；
			getPidInput.value = fileId;

			//每次重新再fileList中生成文件，那么需要给这些文件绑定事件
			tools.each(fileItem,function(item,index){
				fileHandle(item);
			})

			tools.removeClass(checkedAll,"checked");
	}


	//找到文件区域下所有文件
	var fileItem = tools.$(".file-item",fileLise);
	var checkboxs = tools.$(".checkbox",fileLise);

	tools.each(fileItem,function(item){
		fileHandle(item);
	});

	//给单独一个文件添加事件处理
	function fileHandle(item){

		var checkbox = tools.$(".checkbox",item)[0];

		//给每个文件绑定移入移出事件
		tools.addEvent(item,"mouseenter",function(){
			tools.addClass(this,"file-checked");
		});

		tools.addEvent(item,"mouseleave",function(){
			if( !tools.hasClass(checkbox,"checked") ){
				tools.removeClass(this,"file-checked");
			}	
		});

		//给checkbox添加点击事件
		

		tools.addEvent(checkbox,"click",function(e){
			var isAddClass = tools.toggleClass(this,"checked"); 

			if( isAddClass ){
				//判断下所有的checkbox是否被选定
				if( whoSelect().length == checkboxs.length){
					tools.addClass(checkedAll,"checked");
				}
				
			}else{
				//只要当前的这个checkedbox没有被选，那么全选按钮就没有class：checked
				tools.removeClass(checkedAll,"checked");
			}

			//阻止冒泡
			e.stopPropagation();
		});

	}


	//获取到全选按钮
	var checkedAll = tools.$(".checked-all")[0];

	tools.addEvent(checkedAll,"click",function(){
		var isAddClass = tools.toggleClass(this,"checked"); //toggleClassd 返回值是布尔值  true 有添加 false是没有添加
		if( isAddClass ){
			tools.each(fileItem,function(item,index){
				tools.addClass(item,"file-checked");
				//找到每个文件的选择框
				tools.addClass(checkboxs[index],"checked");
			});
		}else{
			tools.each(fileItem,function(item,index){
				tools.removeClass(item,"file-checked");
				//找到每个文件的选择框
				tools.addClass(checkboxs[index],"checked");
			});
		}
	});


	//作用：找到所有checkbox选定的文件
	function whoSelect(){
		var arr = [];
		//循环checkboxs下的checkbox如果有class：checked。那么就放在数组arr中
		tools.each(checkboxs,function(item,index){
			if( tools.hasClass(item,"checked") ){
				arr.push(fileItem[index]);
			}
		})
		return arr;
	}

	//新建文件的功能
	var create = tools.$(".create")[0];

	tools.addEvent(create,"mouseup",function(){
		// 需要把提示为空的class隐藏起来
		empty.style.display = "none";

		var newElement = createFileElement({
			title  : "",
			id : new Date().getTime()
		});

		fileLise.insertBefore(newElement,fileLise.firstElementChild);

		//获取标题
		var fileTitle = tools.$(".file-title",newElement)[0];
		var fileEdtor = tools.$(".file-edtor",newElement)[0];

		var edtor = tools.$(".edtor",newElement)[0];

		fileTitle.style.display = "none";
		fileEdtor.style.display = "block";

		edtor.select(); //自动获取光标

		create.isCreateFile = true; //添加一个状态，表示正在创建文件
	});

	//document绑定一个mousedown，为了创建文件夹
	
	tools.addEvent(document,"mousedown",function(){
		//判断一下新创建的元素中的输入框是否有内容，如果有内容就创建，没有就removeChild
		if( create.isCreateFile ){
			var firstElement = fileLise.firstElementChild;
			var edtor = tools.$(".edtor",firstElement)[0];
			var value = edtor.value.trim();

			


			if( value === "" ){
				fileLise.removeChild(firstElement);

				//要看下fileList里面是否有内容
				if( fileLise.innerHTML === "" ){
					empty.style.display = "block";
				}

			}else{
				//获取标题
				var fileTitle = tools.$(".file-title",firstElement)[0];
				var fileEdtor = tools.$(".file-edtor",firstElement)[0];
				fileTitle.style.display = "block";
				fileEdtor.style.display = "none";

				fileTitle.innerHTML = value;

				//给新创建的文件添加事件处理
				
				fileHandle(firstElement);

				/*
				*1.当前创建文件的title
				*2.在哪一个文件夹下创建的，需要pid
				 */
				var pid = getPidInput.value;

				//当前这个元素的id
				var fileId = tools.$(".item",firstElement)[0].dataset.fileId;

				//把新创建的元素的结构，放在数据中
				var newFileData = {
					id : fileId,
					pid : pid,
					title :value,
					type : "file"
				}
				//放在数据中
				datas.unshift(newFileData);

				//通过pid，找到树形菜单中div元素
				var element = document.querySelector(".tree-title[data-file-id='"+pid+"']");	
				var nextElementUl = element.nextElementSibling;
				//要找到指定的ul，append一个li元素就可以了
				var level = dataControl.getLevelById(datas,fileId);
				nextElementUl.appendChild(createTreeHtml({
					title : value,
					id : fileId,
					level : level
				}));

				if( nextElementUl.innerHTML !== "" ){
					tools.addClass(element,"tree-contro");
					tools.removeClass(element,"tree-contro-none");
				}

				//创建成功提醒！
				tipsFn("ok","新建文件成功！");
			}

			create.isCreateFile = false;//无论创建成不成功，状态都要设为false
		}
	});

	//封装小提醒
	var fullTipBox = tools.$(".full-tip-box")[0];
	var tipText = tools.$(".text",fullTipBox)[0];
	function tipsFn(cls,content){
		//每次调用的时候，都要从-32px向0的位置运动
		fullTipBox.style.top = "-32px";
		fullTipBox.style.transition = "none";

		setTimeout(function(){
			fullTipBox.className = "full-tip-box";
			fullTipBox.style.top = 0;
			fullTipBox.style.transition = ".3s";
			tools.addClass(fullTipBox,cls);
		},0);
		
		clearInterval(fullTipBox.timer);
		fullTipBox.timer = setTimeout(function(){
			fullTipBox.style.top = "-32px";
			//tools.removeClass(fullTipBox,cls);
		},2000);

	}

	//框选的功能
	
	/*
	*	1，生成一个框选的div
	*	2，检测碰撞
	 */
	var newDiv = null;
	var disX = 0, disY = 0;
	tools.addEvent(document,"mousedown",function(e){

		//如果事件元素是在.nav-a这些元素身上，就没有框选效果
		var target = e.target;
		if( tools.parents(target,".nav")){
			return;
		}

		disX = e.clientX;
		disY = e.clientY;

		
		//鼠标移动的过程中
		tools.addEvent(document,"mousemove",moveFn);

		tools.addEvent(document,"mouseup",upFn);

		//去掉默认行为
		e.preventDefault();

	})

	function moveFn(e){

		//在移动的过程中的位置，鼠标点击的位置 >5px时再出现款选
		
		if( Math.abs(e.clientX-disX) >10 || Math.abs(e.clientY-disY) > 10){
			if( !newDiv ){
				newDiv = document.createElement("div");
				newDiv.className = "selectTab";
				document.body.appendChild(newDiv);
			}
			newDiv.style.width = 0;
			newDiv.style.height = 0;

			newDiv.style.display = "block";	

			newDiv.style.left = disX + "px";
			newDiv.style.top = disY + "px";

			var w = e.clientX - disX;
			var y = e.clientY - disY;

			newDiv.style.width = Math.abs(w) + "px";
			newDiv.style.height = Math.abs(y) + "px";

			//鼠标移动的过程中的clientX和在鼠标按下的disX，那个值小就把这个值赋给newDiv
			
			newDiv.style.left = Math.min(e.clientX,disX) + "px";
			newDiv.style.top = Math.min(e.clientY,disY) + "px";

			//做一个碰撞检测
			//拖拽的newDiv和那些文件碰上了，如果碰上的话就给碰上的文件添加样式，没碰上取消样式
			
			tools.each(fileItem,function(item,index){
				if( tools.collisionRect(newDiv,item) ){
					tools.addClass(item,"file-checked");
					tools.addClass(checkboxs[index],"checked");
				}else{
					tools.removeClass(item,"file-checked");
					tools.removeClass(checkboxs[index],"checked");
				}
			});

			if( whoSelect().length === checkboxs.length ){
				tools.addClass(checkedAll,"checked");
			}else{
				tools.removeClass(checkedAll,"checked");
			}
		}

		
	}

	function upFn(){
		tools.removeEvent(document,"mousemove",moveFn);
		tools.removeEvent(document,"mouseup",upFn);
		if( newDiv ){
			newDiv.style.display = "none";
		}	

	}



}())