import { getValidProgress } from "./validateProgress"

describe("getValidProgress", () => {
    test("Обрабатывает допустимые числовые значения в пределах диапазона", () => {
        const newProgress = {
            exercise1: 5,
            exercise2: 20,
            exercise3: 15
        }

        const expected = {
            exercise1: 5,
            exercise2: 20,
            exercise3: 15
        }

        expect(getValidProgress(newProgress)).toEqual(expected)
    })

    test("Заменяет отрицательные значения на 0", () => {
        const newProgress = {
            exercise1: -5,
            exercise2: 20,
            exercise3: -15
        }

        const expected = {
            exercise1: 0,
            exercise2: 20,
            exercise3: 0
        }

        expect(getValidProgress(newProgress)).toEqual(expected)
    })

    test("Игнорирует значения больше заданного диапазона", () => {
        const newProgress = {
            exercise1: 100,
            exercise2: 4444,
            exercise3: 15
        }

        const expected = {
            exercise1: 100,
            exercise2: 100,
            exercise3: 15
        }

        expect(getValidProgress(newProgress)).toEqual(expected)
    })
})