import React, { Component } from "react";
import { Image } from "react-native";

import {
	Content,
	Text,
	List,
	ListItem,
	Icon,
	Container,
	Left,
	Right,
	Badge,
	Button,
	View,
	StyleProvider,
	getTheme,
	variables,
	Thumbnail
} from "native-base";

import styles from "./style";

const drawerCover = require("../../../img/drawer-cover.png");

const drawerImage = require("../../../img/logo.png");

const datas = [
	{
		name: "Routes",
		route: "RoutePlan",
		icon: "bicycle",
		bg: "#C5F442",
	},
	{
		name: "Dashboard",
		route: "UserDashboard",
		icon: "speedometer",
		bg: "#C5F442",
	},
	{
		name: "Gallery",
		route: "Gallery",
		icon: "speedometer",
		bg: "#C5F442",
	},
	{
		name: "Sync",
		route: "SyncPage",
		icon: "cloud-upload",
		bg: "#C5F442",
	},
	{
		name: "Anatomy",
		route: "Anatomy",
		icon: "phone-portrait",
		bg: "#C5F442",
	},
	{
		name: "Actionsheet",
		route: "Actionsheet",
		icon: "easel",
		bg: "#C5F442",
	},
	{
		name: "Header",
		route: "Header",
		icon: "phone-portrait",
		bg: "#477EEA",
		types: "8",
	},
	{
		name: "Footer",
		route: "Footer",
		icon: "phone-portrait",
		bg: "#DA4437",
		types: "4",
	},
	{
		name: "Badge",
		route: "NHBadge",
		icon: "notifications",
		bg: "#4DCAE0",
	},
	{
		name: "Button",
		route: "NHButton",
		icon: "radio-button-off",
		bg: "#1EBC7C",
		types: "9",
	},
	{
		name: "Card",
		route: "NHCard",
		icon: "keypad",
		bg: "#B89EF5",
		types: "5",
	},
	{
		name: "Check Box",
		route: "NHCheckbox",
		icon: "checkmark-circle",
		bg: "#EB6B23",
	},
	{
		name: "Deck Swiper",
		route: "NHDeckSwiper",
		icon: "swap",
		bg: "#3591FA",
		types: "2",
	},
	{
		name: "Fab",
		route: "NHFab",
		icon: "help-buoy",
		bg: "#EF6092",
		types: "2",
	},
	{
		name: "Form & Inputs",
		route: "NHForm",
		icon: "call",
		bg: "#EFB406",
		types: "12",
	},
	{
		name: "Icon",
		route: "NHIcon",
		icon: "information-circle",
		bg: "#EF6092",
	},
	{
		name: "Layout",
		route: "NHLayout",
		icon: "grid",
		bg: "#9F897C",
		types: "5",
	},
	{
		name: "List",
		route: "NHList",
		icon: "lock",
		bg: "#5DCEE2",
		types: "7",
	},
	{
		name: "ListSwipe",
		route: "ListSwipe",
		icon: "swap",
		bg: "#C5F442",
		types: "2",
	},
	{
		name: "Picker",
		route: "NHPicker",
		icon: "arrow-dropdown",
		bg: "#F50C75",
	},
	{
		name: "Radio",
		route: "NHRadio",
		icon: "radio-button-on",
		bg: "#6FEA90",
	},
	{
		name: "SearchBar",
		route: "NHSearchbar",
		icon: "search",
		bg: "#29783B",
	},
	{
		name: "Segment",
		route: "Segment",
		icon: "menu",
		bg: "#0A2C6B",
		types: "2",
	},
	{
		name: "Spinner",
		route: "NHSpinner",
		icon: "navigate",
		bg: "#BE6F50",
	},
	{
		name: "Tabs",
		route: "NHTab",
		icon: "home",
		bg: "#AB6AED",
		types: "3",
	},
	{
		name: "Thumbnail",
		route: "NHThumbnail",
		icon: "image",
		bg: "#cc0000",
		types: "2",
	},
	{
		name: "Toast",
		route: "Toast",
		icon: "albums",
		bg: "#C5F442",
	},
	{
		name: "Typography",
		route: "NHTypography",
		icon: "paper",
		bg: "#48525D",
	},
];

export default class SideBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			shadowOffsetWidth: 1,
			shadowRadius: 4,
		};
	}

	_navigate(data) {
		if (data.route === 'SyncPage') {
			this.props.navigation.navigate(data.route,null);
		}
		else {
			this.props.navigation.navigate(data.route);
		}
	}

	render() {
		return (
			<Container>
				<View style={[styles.drawerCover, { justifyContent: "center", alignItems: "center" }]}>
					<Thumbnail square source={drawerImage} style={{ width: 150, height: 150 }} />
				</View>
				<Content bounces={false} style={{ flex: 1, backgroundColor: "#fff" , borderTopColor:'#b2b0b0', borderTopWidth:1 }}>
					<List
						dataArray={datas}
						renderRow={data =>
							<ListItem button noBorder onPress={() => this._navigate(data)}>
								<Left>
									<Icon active name={data.icon} style={{ color: "#777", fontSize: 26, width: 30 }} />
									<Text style={styles.text}>
										{data.name}
									</Text>
								</Left>
								{data.types &&
									<Right style={{ flex: 1 }}>
										<Badge
											style={{
												borderRadius: 3,
												height: 25,
												width: 72,
												backgroundColor: data.bg,
											}}
										>
											<Text style={styles.badgeText}>{`${data.types}`}</Text>
										</Badge>
									</Right>}
							</ListItem>}
					/>
				</Content>
			</Container>
		);
	}
}
