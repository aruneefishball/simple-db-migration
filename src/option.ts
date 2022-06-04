export type OptionType = {
	hashOnly: boolean
}
let _option: OptionType = {
	hashOnly: false
}

export function setOption(option: OptionType) {
	_option = option
}

export function getOption(): OptionType {
	return _option
}