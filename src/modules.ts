/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 12:46                     |
 * +-------------------------------------------+
 */
import Vue from 'vue';

import {
	Message, Modal, Tooltip, Poptip,
	RadioGroup, Radio, Tabs, TabPane,
	Dropdown, DropdownMenu, DropdownItem,
	Slider, CheckboxGroup, Checkbox, Icon
} from 'view-design';

const components = {
	Message, Modal, Tooltip, Poptip,
	RadioGroup, Radio, Tabs, TabPane,
	Dropdown, DropdownMenu, DropdownItem,
	Slider, CheckboxGroup, Checkbox, Icon
};

const modules: { [index: string]: any } = components;

Vue.prototype.$Modal = Modal;
Vue.prototype.$Message = Message;
Object.keys(modules).forEach((key) => {
	Vue.component(key, modules[key]);
});
